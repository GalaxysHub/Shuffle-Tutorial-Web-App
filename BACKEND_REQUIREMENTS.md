# Backend Requirements - Firebase Cloud Functions

This document outlines the **required server-side components** that must be implemented for the Shuffle Dance Academy application to function properly with Stripe payments and Firebase.

## Critical Backend Components Needed

### 1. Firebase Cloud Functions for Stripe Integration

#### `/api/create-subscription-checkout-session` (POST)
**Purpose**: Create a Stripe Checkout Session for monthly subscription

**Required Implementation**:
```javascript
const functions = require('firebase-functions');
const stripe = require('stripe')(functions.config().stripe.secret_key);
const admin = require('firebase-admin');

exports.createSubscriptionCheckoutSession = functions.https.onCall(async (data, context) => {
  // Verify user authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { userId, email } = data;
  
  try {
    // Get or create Stripe customer
    let customer = await getOrCreateStripeCustomer(userId, email);
    
    // Create Stripe Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: 'price_YOUR_MONTHLY_SUBSCRIPTION_ID', // Replace with actual Price ID
        quantity: 1,
      }],
      success_url: `${functions.config().app.url}/premium?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${functions.config().app.url}/subscribe`,
      metadata: {
        userId: userId,
      },
    });

    return { sessionId: session.id };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

#### `/api/create-one-time-checkout-session` (POST)
**Purpose**: Create a Stripe Checkout Session for individual class purchase

**Required Implementation**:
```javascript
exports.createOneTimeCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { userId, email, classId, priceId } = data;
  
  try {
    let customer = await getOrCreateStripeCustomer(userId, email);
    
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${functions.config().app.url}/watch/${classId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${functions.config().app.url}/classes`,
      metadata: {
        userId: userId,
        classId: classId,
      },
    });

    return { sessionId: session.id };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

### 2. Stripe Webhook Handler (CRITICAL)

#### Webhook Endpoint: `/stripe-webhook` (POST)
**Purpose**: Handle Stripe events and update Firestore accordingly

**Required Events**:
1. `checkout.session.completed` - Update user data after successful payment
2. `customer.subscription.created` - Set subscription status to active
3. `customer.subscription.updated` - Update subscription status changes
4. `customer.subscription.deleted` - Handle subscription cancellation
5. `invoice.payment_succeeded` - Confirm subscription renewal
6. `invoice.payment_failed` - Handle failed payments

**Implementation**:
```javascript
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, functions.config().stripe.webhook_secret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({received: true});
  } catch (error) {
    console.error('Webhook handler failed:', error);
    res.status(500).send('Webhook handler failed');
  }
});

async function handleCheckoutSessionCompleted(session) {
  const userId = session.metadata.userId;
  const userRef = admin.firestore().collection('users').doc(userId);
  
  if (session.mode === 'subscription') {
    // Handle subscription signup
    await userRef.update({
      subscriptionStatus: 'active',
      stripeCustomerId: session.customer,
    });
  } else if (session.mode === 'payment') {
    // Handle one-time purchase
    const classId = session.metadata.classId;
    await userRef.update({
      purchasedClasses: admin.firestore.FieldValue.arrayUnion(classId),
      stripeCustomerId: session.customer,
    });
  }
}

async function handleSubscriptionUpdated(subscription) {
  // Find user by Stripe customer ID
  const usersRef = admin.firestore().collection('users');
  const snapshot = await usersRef.where('stripeCustomerId', '==', subscription.customer).get();
  
  if (!snapshot.empty) {
    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
      subscriptionStatus: subscription.status
    });
  }
}

async function handleSubscriptionDeleted(subscription) {
  const usersRef = admin.firestore().collection('users');
  const snapshot = await usersRef.where('stripeCustomerId', '==', subscription.customer).get();
  
  if (!snapshot.empty) {
    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
      subscriptionStatus: 'canceled'
    });
  }
}
```

### 3. Helper Functions

#### Customer Management
```javascript
async function getOrCreateStripeCustomer(userId, email) {
  const userRef = admin.firestore().collection('users').doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.data();
  
  if (userData.stripeCustomerId) {
    return await stripe.customers.retrieve(userData.stripeCustomerId);
  } else {
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        firebaseUID: userId
      }
    });
    
    await userRef.update({
      stripeCustomerId: customer.id
    });
    
    return customer;
  }
}
```

## Stripe Configuration Required

### 1. Products and Prices Setup
Create these in your Stripe Dashboard:

**Monthly Subscription Product**:
- Product Name: "Shuffle Dance Academy Premium"
- Price ID: `price_xxxxx` (replace in Cloud Functions)
- Billing: Monthly recurring
- Price: $19.99 USD

**Individual Class Products**:
Create separate products for each class with one-time pricing.

### 2. Webhook Configuration
Configure Stripe webhook endpoint:
- URL: `https://your-region-your-project.cloudfunctions.net/stripeWebhook`
- Events to send:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

## Environment Variables Needed

### Firebase Cloud Functions Config
```bash
firebase functions:config:set stripe.secret_key="sk_test_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."
firebase functions:config:set app.url="https://your-app-domain.com"
```

### Client-side Environment Variables
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_STRIPE_PUBLIC_KEY=pk_test_your_public_key
```

## Deployment Steps

1. **Initialize Firebase Functions**:
   ```bash
   firebase init functions
   cd functions
   npm install stripe firebase-admin
   ```

2. **Deploy Functions**:
   ```bash
   firebase deploy --only functions
   ```

3. **Update Client URLs**:
   Update the client-side code to call the deployed Cloud Function URLs instead of the placeholder `/api/` endpoints.

4. **Configure Firestore Security Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Security Considerations

1. **Webhook Signature Verification**: Always verify Stripe webhook signatures
2. **User Authentication**: Verify Firebase Auth tokens in Cloud Functions
3. **Data Validation**: Validate all input data before processing
4. **Error Handling**: Implement comprehensive error handling and logging
5. **Rate Limiting**: Implement rate limiting to prevent abuse

## Testing

1. **Use Stripe Test Mode**: Use test keys for development
2. **Test Webhook Locally**: Use Stripe CLI for local webhook testing
3. **Test Payment Flows**: Test both subscription and one-time payment flows
4. **Test Edge Cases**: Test payment failures, subscription cancellations, etc.

This backend implementation is **essential** for the application to function properly with payments and user access control.