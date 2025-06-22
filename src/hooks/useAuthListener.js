import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { setUser, fetchUserData } from '../store/authSlice';

export const useAuthListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
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