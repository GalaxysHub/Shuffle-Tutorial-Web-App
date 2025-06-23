import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';
import app from '../services/firebase';
import stripePromise from '../services/stripe';

// Initialize Firebase Functions
const functions = getFunctions(app);

// Async thunk for creating subscription checkout session
export const createSubscriptionCheckoutSession = createAsyncThunk(
  'payment/createSubscriptionCheckoutSession',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as RootState;
      if (!auth.user) {
        throw new Error('User must be logged in to subscribe');
      }

      // Call Firebase Cloud Function
      const createSession = httpsCallable(functions, 'createSubscriptionCheckoutSession');
      const result = await createSession({
        userId: auth.user.uid,
        email: auth.user.email
      });

      const { sessionId } = result.data;
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const checkoutResult = await stripe.redirectToCheckout({ sessionId });

      if (checkoutResult.error) {
        throw new Error(checkoutResult.error.message);
      }

      return sessionId;
    } catch (error) {
      console.error('Subscription checkout error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for creating one-time checkout session for individual classes
export const createOneTimeCheckoutSession = createAsyncThunk(
  'payment/createOneTimeCheckoutSession',
  async ({ classId, priceId }: { classId: string; priceId: string }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as RootState;
      if (!auth.user) {
        throw new Error('User must be logged in to purchase');
      }

      // Call Firebase Cloud Function
      const createSession = httpsCallable(functions, 'createOneTimeCheckoutSession');
      const result = await createSession({
        userId: auth.user.uid,
        email: auth.user.email,
        classId,
        priceId
      });

      const { sessionId } = result.data;
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const checkoutResult = await stripe.redirectToCheckout({ sessionId });

      if (checkoutResult.error) {
        throw new Error(checkoutResult.error.message);
      }

      return { sessionId, classId };
    } catch (error) {
      console.error('One-time checkout error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for getting user subscription info
export const getUserSubscriptionInfo = createAsyncThunk(
  'payment/getUserSubscriptionInfo',
  async (_, { rejectWithValue }) => {
    try {
      const getSubscriptionInfo = httpsCallable(functions, 'getUserSubscriptionInfo');
      const result = await getSubscriptionInfo();
      return result.data;
    } catch (error) {
      console.error('Get subscription info error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for creating customer portal session
export const createCustomerPortalSession = createAsyncThunk(
  'payment/createCustomerPortalSession',
  async (_, { rejectWithValue }) => {
    try {
      const createPortalSession = httpsCallable(functions, 'createCustomerPortalSession');
      const result = await createPortalSession();
      const { url } = result.data;
      
      // Redirect to customer portal
      window.open(url, '_blank');
      
      return url;
    } catch (error) {
      console.error('Customer portal error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  isProcessingPayment: false,
  paymentError: null,
  lastPaymentIntent: null
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.paymentError = null;
    },
    setPaymentIntent: (state, action) => {
      state.lastPaymentIntent = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Subscription checkout
      .addCase(createSubscriptionCheckoutSession.pending, (state) => {
        state.isProcessingPayment = true;
        state.paymentError = null;
      })
      .addCase(createSubscriptionCheckoutSession.fulfilled, (state, action) => {
        state.isProcessingPayment = false;
        state.lastPaymentIntent = action.payload;
      })
      .addCase(createSubscriptionCheckoutSession.rejected, (state, action) => {
        state.isProcessingPayment = false;
        state.paymentError = action.payload;
      })
      // One-time checkout
      .addCase(createOneTimeCheckoutSession.pending, (state) => {
        state.isProcessingPayment = true;
        state.paymentError = null;
      })
      .addCase(createOneTimeCheckoutSession.fulfilled, (state, action) => {
        state.isProcessingPayment = false;
        state.lastPaymentIntent = action.payload;
      })
      .addCase(createOneTimeCheckoutSession.rejected, (state, action) => {
        state.isProcessingPayment = false;
        state.paymentError = action.payload;
      })
      // Get subscription info
      .addCase(getUserSubscriptionInfo.pending, (state) => {
        state.isProcessingPayment = true;
        state.paymentError = null;
      })
      .addCase(getUserSubscriptionInfo.fulfilled, (state, action) => {
        state.isProcessingPayment = false;
        // This data will be used to update auth state elsewhere
      })
      .addCase(getUserSubscriptionInfo.rejected, (state, action) => {
        state.isProcessingPayment = false;
        state.paymentError = action.payload;
      })
      // Customer portal
      .addCase(createCustomerPortalSession.pending, (state) => {
        state.isProcessingPayment = true;
        state.paymentError = null;
      })
      .addCase(createCustomerPortalSession.fulfilled, (state) => {
        state.isProcessingPayment = false;
      })
      .addCase(createCustomerPortalSession.rejected, (state, action) => {
        state.isProcessingPayment = false;
        state.paymentError = action.payload;
      });
  }
});

export const { clearPaymentError, setPaymentIntent } = paymentSlice.actions;
export default paymentSlice.reducer;