import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth } from '../services/firebase';
import { setUser, fetchUserData } from '../store/authSlice';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { AppDispatch } from '../store';

export const useAuthListener = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handleRedirectAndAuth = async () => {
      try {
        // Check for redirect result first
        console.log('Checking for Google redirect result...');
        const result = await getRedirectResult(auth);
        
        if (result) {
          console.log('Google redirect result found:', result.user.email);
          const user = result.user;
          
          // Check if user document exists, create if not
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // Create user document for new Google users
            await setDoc(userDocRef, {
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              subscriptionStatus: 'none',
              purchasedClasses: [],
              stripeCustomerId: null,
              createdAt: new Date(),
              authProvider: 'google'
            });
          }
          
          // Dispatch the user data
          dispatch(setUser({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName,
            photoURL: user.photoURL,
            subscriptionStatus: userDoc.exists() ? userDoc.data()?.subscriptionStatus || 'none' : 'none',
            purchasedClasses: userDoc.exists() ? userDoc.data()?.purchasedClasses || [] : []
          }));
        } else {
          console.log('No Google redirect result found');
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
      }
    };

    // Handle redirect result first
    handleRedirectAndAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, fetch their data from Firestore
        dispatch(fetchUserData(user.uid));
      } else {
        // User is signed out
        dispatch(setUser(null));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);
};