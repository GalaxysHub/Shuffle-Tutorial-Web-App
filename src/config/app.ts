import type { AppConfig } from '../types';

export const APP_CONFIG: AppConfig = {
  name: 'Shuffle Dance Academy',
  description: 'Learn shuffle dance with professional tutorials and classes',
  url: process.env.NODE_ENV === 'production' 
    ? 'https://your-vercel-app.vercel.app' 
    : 'http://localhost:5173',
  version: '1.0.0',
  author: 'Shuffle Dance Academy',
  keywords: ['shuffle dance', 'dance tutorials', 'dance classes', 'learn to dance'],
  
  // Stripe Configuration
  stripe: {
    publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51RcwCBEIXt2oXu5m5ZeG50G4ymCTf8XyxWRCyu4gUmThZMMzVuFnt6R9tABnHncnNMkGnuiCPaxYLu21FhvuNqO3007M1w4ayl',
    subscriptionPriceId: 'price_1OFKMlCvJVWUk6kNDCM6AHn0KqIpUsOD',
    currency: 'usd',
    subscriptionPrice: 19.99
  },

  // Firebase Configuration
  firebase: {
    apiKey: "AIzaSyDJRx8nPOSi-qmHoqoBb20GPCy78Ci0WsM",
    authDomain: "shuffle-tut.firebaseapp.com",
    projectId: "shuffle-tut",
    storageBucket: "shuffle-tut.firebasestorage.app",
    messagingSenderId: "359852501217",
    appId: "1:359852501217:web:ba0be826f0430f80302fa0",
    measurementId: "G-6798K8L9Z5"
  },

  // Theme Configuration
  theme: {
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    darkMode: true
  },

  // Content Configuration
  content: {
    subscriptionBenefits: [
      'Access to all premium dance tutorials',
      'Monthly live Q&A sessions',
      'Exclusive choreography content',
      'Progress tracking and feedback',
      'Community forum access'
    ],
    pricingTiers: {
      subscription: {
        name: 'Premium Access',
        price: 19.99,
        period: 'month',
        features: [
          'Unlimited access to premium tutorials',
          'New content added weekly',
          'Live Q&A sessions',
          'Community access'
        ]
      }
    }
  }
};