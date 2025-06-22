# Deployment Guide - Shuffle Dance Academy Backend

This guide covers deploying the Firebase Cloud Functions backend for your Shuffle Dance Academy application.

## Prerequisites

1. **Firebase CLI installed**: `npm install -g firebase-tools`
2. **Firebase project**: `shuffle-tut` (already configured)
3. **Stripe account** with test/live keys
4. **Google Cloud billing enabled** (required for external API calls)

## Step 1: Configure Environment Variables

### Set Firebase Functions Config

```bash
# Navigate to your project root
cd /home/galaxy/Desktop/dev/shuffle-tut-site/shuffle-dance-app

# Set Stripe secret key (use your actual secret key)
firebase functions:config:set stripe.secret_key="sk_test_YOUR_STRIPE_SECRET_KEY"

# Set Stripe webhook secret (get this from Stripe Dashboard after creating webhook)
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_WEBHOOK_SECRET"

# Set your app URL
firebase functions:config:set app.url="https://your-domain.com"  # or http://localhost:5174 for dev

# View current config
firebase functions:config:get
```

### Your Stripe Keys
Based on your public key `pk_test_51RcwCBEIXt2oXu5m...`, your secret key should be:
```bash
firebase functions:config:set stripe.secret_key="sk_test_YOUR_STRIPE_SECRET_KEY"
```

## Step 2: Set Up Stripe Products and Pricing

### In Stripe Dashboard:

1. **Create Monthly Subscription Product**:
   - Go to Products → Add Product
   - Name: "Shuffle Dance Academy Premium"
   - Pricing: $19.99/month recurring
   - Copy the Price ID (starts with `price_`)

2. **Create Individual Class Products**:
   - Master Class: Competition Prep ($29.99)
   - Freestyle Workshop ($19.99) 
   - History & Culture ($14.99)

3. **Update Price IDs in Functions**:
   ```javascript
   // In functions/index.js, line 49
   price: 'price_YOUR_ACTUAL_SUBSCRIPTION_PRICE_ID',
   ```

## Step 3: Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:createSubscriptionCheckoutSession

# Deploy with force (if needed)
firebase deploy --only functions --force
```

## Step 4: Set Up Stripe Webhooks

### Create Webhook Endpoint:

1. Go to Stripe Dashboard → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://us-central1-shuffle-tut.cloudfunctions.net/stripeWebhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Copy the webhook signing secret (`whsec_...`)
6. Set it in Firebase config:
   ```bash
   firebase functions:config:set stripe.webhook_secret="whsec_YOUR_WEBHOOK_SECRET"
   firebase deploy --only functions
   ```

## Step 5: Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

## Step 6: Enable Firebase Authentication

1. Go to Firebase Console → Authentication
2. Enable these sign-in methods:
   - Email/Password ✅
   - Google ✅ (already configured)

## Step 7: Test the Deployment

### Test Functions Locally (Optional):

```bash
# Start Firebase emulators
firebase emulators:start --only functions

# Functions will be available at:
# http://localhost:5001/shuffle-tut/us-central1/createSubscriptionCheckoutSession
```

### Test Live Functions:

1. Start your React app: `npm run dev`
2. Try creating a subscription (will redirect to Stripe)
3. Use Stripe test card: `4242 4242 4242 4242`
4. Check Firebase Functions logs: `firebase functions:log`

## Step 8: Monitor and Debug

### View Function Logs:
```bash
# Stream logs in real-time
firebase functions:log --only createSubscriptionCheckoutSession

# View all function logs
firebase functions:log
```

### Common Issues:

1. **"Function not found"**:
   - Ensure functions are deployed: `firebase deploy --only functions`
   - Check function names match client-side calls

2. **"Stripe key not configured"**:
   - Set config: `firebase functions:config:set stripe.secret_key="sk_test_..."`
   - Redeploy: `firebase deploy --only functions`

3. **CORS errors**:
   - Functions automatically handle CORS for Firebase clients

4. **Webhook signature verification failed**:
   - Ensure webhook secret is correct
   - Check Stripe webhook is pointing to correct URL

## Step 9: Production Deployment

### When deploying to production:

1. **Update Stripe keys** to live keys:
   ```bash
   firebase functions:config:set stripe.secret_key="sk_live_YOUR_LIVE_KEY"
   ```

2. **Update app URL**:
   ```bash
   firebase functions:config:set app.url="https://yourdomain.com"
   ```

3. **Update webhook URL** in Stripe to production function URL

4. **Deploy frontend**:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Function URLs

After deployment, your functions will be available at:

- `https://us-central1-shuffle-tut.cloudfunctions.net/createSubscriptionCheckoutSession`
- `https://us-central1-shuffle-tut.cloudfunctions.net/createOneTimeCheckoutSession`
- `https://us-central1-shuffle-tut.cloudfunctions.net/stripeWebhook`
- `https://us-central1-shuffle-tut.cloudfunctions.net/getUserSubscriptionInfo`
- `https://us-central1-shuffle-tut.cloudfunctions.net/createCustomerPortalSession`

## Security Checklist

- [ ] Stripe secret keys configured (not exposed in frontend)
- [ ] Webhook signatures verified
- [ ] Firebase auth required for sensitive functions
- [ ] Firestore security rules deployed
- [ ] Function environment variables set
- [ ] Test payments working with Stripe test cards
- [ ] Webhook events being received and processed

## Support

If you encounter issues:
1. Check Firebase Functions logs: `firebase functions:log`
2. Verify Stripe webhook delivery in Stripe Dashboard
3. Test with Stripe test cards: https://stripe.com/docs/testing
4. Check Firebase Console for quota/billing issues