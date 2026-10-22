const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ 
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'https://shuffle-tutorial-web-app.vercel.app',
    'https://shuffle-dance-app.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Secrets come from the environment (functions/.env, see functions/.env.example).
// Never hardcode Stripe keys here.
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const APP_URL = process.env.APP_URL || 'https://shuffle-tutorial-web-app.vercel.app';

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set. Copy functions/.env.example to functions/.env and fill it in.');
}

const stripe = require('stripe')(STRIPE_SECRET_KEY);

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Helper function to get or create Stripe customer
async function getOrCreateStripeCustomer(userId, email) {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    // Check if user document exists and has stripeCustomerId
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData && userData.stripeCustomerId) {
        try {
          const customer = await stripe.customers.retrieve(userData.stripeCustomerId);
          return customer;
        } catch (error) {
          console.log('Customer not found in Stripe, creating new one:', error);
        }
      }
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        firebaseUID: userId
      }
    });

    // Create or update user document with Stripe customer ID
    await userRef.set({
      stripeCustomerId: customer.id,
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return customer;
  } catch (error) {
    console.error('Error in getOrCreateStripeCustomer:', error);
    throw error;
  }
}

// Cloud Function: Create Subscription Checkout Session (Callable)
exports.createSubscriptionCheckoutSession = functions.https.onCall(async (data, context) => {
  console.log('Function called with context:', !!context.auth);
  console.log('Function called with data:', data);
  
  // For now, make it work without auth for testing
  const { userId, email } = data;
  
  // Use test data if no auth
  const safeUserId = userId || 'test-user-123';
  const safeEmail = email || 'test@example.com';
  
  console.log('Using user data:', { safeUserId, safeEmail });

  try {
    console.log('Creating subscription checkout session for user:', safeUserId);

    // Get or create Stripe customer
    const customer = await getOrCreateStripeCustomer(safeUserId, safeEmail);
    
    // Get or create the subscription price for existing product
    let priceId;
    try {
      const productId = 'prod_SYAFXQgaRgEwxA'; // Your existing product ID
      
      // Check if a price already exists for this product
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
        limit: 1
      });

      if (prices.data.length > 0) {
        priceId = prices.data[0].id;
        console.log('Using existing price:', priceId);
      } else {
        // Create a new price for the existing product
        const price = await stripe.prices.create({
          unit_amount: 1999, // $19.99 in cents
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
          product: productId,
        });
        priceId = price.id;
        console.log('Created new price:', priceId);
      }
    } catch (priceError) {
      console.error('Error getting/creating price:', priceError);
      throw new Error('Unable to get subscription price');
    }

    // Create Stripe Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${APP_URL}/premium?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/subscribe`,
      metadata: {
        userId: safeUserId,
        type: 'subscription'
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    console.log('Subscription checkout session created:', session.id);
    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating subscription checkout session:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Cloud Function: Create One-Time Checkout Session
exports.createOneTimeCheckoutSession = functions.https.onCall(async (data, context) => {
  // Verify user authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { userId, email, classId, priceId } = data;
  
  // Validate input
  if (!userId || !email || !classId || !priceId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: userId, email, classId, priceId');
  }

  try {
    console.log('Creating one-time checkout session for user:', userId, 'class:', classId);

    // Get or create Stripe customer
    const customer = await getOrCreateStripeCustomer(userId, email);
    
    // Create Stripe Checkout Session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${APP_URL}/watch/${classId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/classes`,
      metadata: {
        userId: userId,
        classId: classId,
        type: 'one_time_purchase'
      },
      billing_address_collection: 'required',
    });

    console.log('One-time checkout session created:', session.id);
    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating one-time checkout session:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Stripe Webhook Handler
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const webhookSecret = STRIPE_WEBHOOK_SECRET;
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Received Stripe webhook event:', event.type, event.id);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler failed:', error);
    res.status(500).send('Webhook handler failed');
  }
});

// Handle successful checkout session
async function handleCheckoutSessionCompleted(session) {
  const userId = session.metadata.userId;
  const userRef = db.collection('users').doc(userId);
  
  console.log('Handling checkout session completed for user:', userId);

  try {
    if (session.mode === 'subscription') {
      // Handle subscription signup
      await userRef.update({
        subscriptionStatus: 'active',
        stripeCustomerId: session.customer,
        lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('Updated user subscription status to active');
    } else if (session.mode === 'payment') {
      // Handle one-time purchase
      const classId = session.metadata.classId;
      await userRef.update({
        purchasedClasses: admin.firestore.FieldValue.arrayUnion(classId),
        stripeCustomerId: session.customer,
        lastPurchaseDate: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('Added class to user purchases:', classId);
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription) {
  console.log('Handling subscription created:', subscription.id);
  await updateUserSubscriptionStatus(subscription.customer, 'active');
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
  console.log('Handling subscription updated:', subscription.id, 'status:', subscription.status);
  await updateUserSubscriptionStatus(subscription.customer, subscription.status);
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  console.log('Handling subscription deleted:', subscription.id);
  await updateUserSubscriptionStatus(subscription.customer, 'canceled');
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Handling invoice payment succeeded:', invoice.id);
  
  if (invoice.subscription) {
    // Update last payment date for subscription renewals
    const usersSnapshot = await db.collection('users')
      .where('stripeCustomerId', '==', invoice.customer)
      .get();
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      await userDoc.ref.update({
        lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
        subscriptionStatus: 'active'
      });
    }
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice) {
  console.log('Handling invoice payment failed:', invoice.id);
  
  if (invoice.subscription) {
    await updateUserSubscriptionStatus(invoice.customer, 'past_due');
  }
}

// Helper function to update user subscription status
async function updateUserSubscriptionStatus(stripeCustomerId, status) {
  try {
    const usersSnapshot = await db.collection('users')
      .where('stripeCustomerId', '==', stripeCustomerId)
      .get();
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      await userDoc.ref.update({
        subscriptionStatus: status,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('Updated user subscription status:', status);
    } else {
      console.log('No user found with stripeCustomerId:', stripeCustomerId);
    }
  } catch (error) {
    console.error('Error updating user subscription status:', error);
    throw error;
  }
}

// Cloud Function: Get User Subscription Info
exports.getUserSubscriptionInfo = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const userId = context.auth.uid;

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User document not found');
    }

    const userData = userDoc.data();
    const stripeCustomerId = userData.stripeCustomerId;

    if (!stripeCustomerId) {
      return {
        subscriptionStatus: 'none',
        purchasedClasses: userData.purchasedClasses || []
      };
    }

    // Get latest subscription info from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      limit: 1
    });

    const subscription = subscriptions.data[0];
    let subscriptionStatus = 'none';

    if (subscription) {
      subscriptionStatus = subscription.status;
      
      // Update Firestore with latest status
      await db.collection('users').doc(userId).update({
        subscriptionStatus: subscriptionStatus
      });
    }

    return {
      subscriptionStatus: subscriptionStatus,
      purchasedClasses: userData.purchasedClasses || [],
      stripeCustomerId: stripeCustomerId
    };
  } catch (error) {
    console.error('Error getting user subscription info:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Cloud Function: Create Customer Portal Session
exports.createCustomerPortalSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const userId = context.auth.uid;

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User document not found');
    }

    const userData = userDoc.data();
    const stripeCustomerId = userData.stripeCustomerId;

    if (!stripeCustomerId) {
      throw new functions.https.HttpsError('failed-precondition', 'No Stripe customer found');
    }

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${APP_URL}/profile`,
    });

    return { url: portalSession.url };
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

