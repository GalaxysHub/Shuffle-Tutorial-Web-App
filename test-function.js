// Test Firebase Cloud Function
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_6HkvOwmLpK3sXW8hU6yW7WX7Qo2nzzQ",
  authDomain: "shuffle-tut.firebaseapp.com",
  projectId: "shuffle-tut",
  storageBucket: "shuffle-tut.firebasestorage.app",
  messagingSenderId: "359852501217",
  appId: "1:359852501217:web:0e885b3d0a7e7d32f5a51b",
  measurementId: "G-9K3LNPXQV1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

async function testFunction() {
  try {
    console.log('Testing Firebase Cloud Function...');
    
    const testFunc = httpsCallable(functions, 'testFunction');
    const result = await testFunc({ 
      message: 'Hello from Node.js client!', 
      timestamp: Date.now() 
    });
    
    console.log('Function result:', JSON.stringify(result.data, null, 2));
  } catch (error) {
    console.error('Error calling function:', error);
  }
}

// Run the test
testFunction();