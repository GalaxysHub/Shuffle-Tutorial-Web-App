// User types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  subscriptionStatus: SubscriptionStatus;
  purchasedClasses: string[];
}

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';

// Auth state types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  subscriptionStatus: SubscriptionStatus;
  purchasedClasses: string[];
}

// Tutorial/Class types
export interface Tutorial {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: string | number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  level?: string;
  isFree?: boolean;
  isPremium?: boolean;
  accessType: 'free' | 'subscription' | 'individual_purchase';
  price?: number;
  priceId?: string;
  productId?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  stripeProductId: string;
  stripePriceId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Content state types
export interface ContentState {
  allTutorials: Tutorial[];
  freeTutorials: Tutorial[];
  premiumVideos: Tutorial[];
  individualClasses: Tutorial[];
  isLoading: boolean;
  error: string | null;
}

// App config types
export interface AppConfig {
  name: string;
  description: string;
  url: string;
  version: string;
  author: string;
  keywords: string[];
  stripe: {
    publicKey: string;
    subscriptionPriceId: string;
    currency: string;
    subscriptionPrice: number;
  };
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    darkMode: boolean;
  };
  content: {
    subscriptionBenefits: string[];
    pricingTiers: {
      subscription: {
        name: string;
        price: number;
        period: string;
        features: string[];
      };
    };
  };
}

// Stripe types
export interface StripeCheckoutResponse {
  sessionId: string;
}

// Firebase Function types
export interface CreateCheckoutSessionData {
  userId: string;
  email: string;
  classId?: string;
  priceId?: string;
}

// Payment state types
export interface PaymentState {
  isProcessingPayment: boolean;
  paymentError: string | null;
  lastPaymentIntent: any;
}