import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

export const testCloudFunction = async () => {
  try {
    const testFunc = httpsCallable(functions, 'testFunction');
    const result = await testFunc({ 
      message: 'Hello from React app!', 
      timestamp: Date.now() 
    });
    
    console.log('Function result:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error calling function:', error);
    throw error;
  }
};

export const testSubscriptionFunction = async () => {
  try {
    const subscriptionFunc = httpsCallable(functions, 'createSubscriptionCheckoutSession');
    const result = await subscriptionFunc({ 
      userId: 'test123',
      email: 'test@example.com'
    });
    
    console.log('Subscription function result:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error calling subscription function:', error);
    throw error;
  }
};