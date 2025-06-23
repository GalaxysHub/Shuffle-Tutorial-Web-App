// Configuration validation utility
interface Config {
  firebase: {
    projectId: string;
    authDomain: string;
    isConfigured: boolean;
  };
  stripe: {
    publicKey: string | undefined;
    isConfigured: boolean;
    isTestMode: boolean;
  };
}

export const validateConfig = (): Config => {
  const config = {
    firebase: {
      projectId: 'shuffle-tut',
      authDomain: 'shuffle-tut.firebaseapp.com',
      isConfigured: true
    },
    stripe: {
      publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
      isConfigured: !!import.meta.env.VITE_STRIPE_PUBLIC_KEY,
      isTestMode: import.meta.env.VITE_STRIPE_PUBLIC_KEY?.startsWith('pk_test_')
    }
  };

  // Log configuration status in development
  if (import.meta.env.DEV) {
    console.log('🔧 Configuration Status:');
    console.log('✅ Firebase configured:', config.firebase.isConfigured);
    console.log('✅ Stripe configured:', config.stripe.isConfigured);
    console.log('🧪 Stripe test mode:', config.stripe.isTestMode);
    
    if (!config.stripe.isConfigured) {
      console.warn('⚠️ Stripe public key not found. Payment features will not work.');
    }
  }

  return config;
};

// Export for easy access in components
export const isConfigurationValid = (): boolean => {
  const config = validateConfig();
  return config.firebase.isConfigured && config.stripe.isConfigured;
};