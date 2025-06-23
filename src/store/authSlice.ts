import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';
import type { User, AuthState, SubscriptionStatus } from '../types';

// Async thunk for user registration
export const registerUser = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>(
  'auth/registerUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        subscriptionStatus: 'none',
        purchasedClasses: [],
        stripeCustomerId: null, // Will be set when first payment is made
        createdAt: new Date()
      });

      return {
        uid: user.uid,
        email: user.email,
        subscriptionStatus: 'none',
        purchasedClasses: []
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for Google sign-in (using redirect)
export const signInWithGoogle = createAsyncThunk<
  { pending: true },
  void,
  { rejectValue: string }
>(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Starting Google Sign-In redirect...');
      await signInWithRedirect(auth, googleProvider);
      // The result will be handled by handleRedirectResult
      return { pending: true };
    } catch (error: any) {
      console.error('Google Sign-In redirect error:', error);
      return rejectWithValue(error.message || 'Failed to initiate Google Sign-In');
    }
  }
);

// Async thunk to handle redirect result
export const handleRedirectResult = createAsyncThunk<
  User | null,
  void,
  { rejectValue: string }
>(
  'auth/handleRedirectResult',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Checking for redirect result...');
      const result = await getRedirectResult(auth);
      if (!result) {
        console.log('No redirect result found');
        return null; // No redirect result
      }
      
      console.log('Redirect result found:', result.user.email);
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
        
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          subscriptionStatus: 'none',
          purchasedClasses: []
        };
      } else {
        // Return existing user data
        const userData = userDoc.data();
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          subscriptionStatus: userData?.subscriptionStatus || 'none',
          purchasedClasses: userData?.purchasedClasses || []
        };
      }
    } catch (error: any) {
      console.error('Error handling redirect result:', error);
      return rejectWithValue(error.message || 'Failed to handle Google Sign-In redirect');
    }
  }
);

// Async thunk for user login
export const loginUser = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      return {
        uid: user.uid,
        email: user.email,
        subscriptionStatus: userData?.subscriptionStatus || 'none',
        purchasedClasses: userData?.purchasedClasses || []
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for user logout
export const logoutUser = createAsyncThunk<
  null,
  void,
  { rejectValue: string }
>(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching user data from Firestore
export const fetchUserData = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>(
  'auth/fetchUserData',
  async (uid: string, { rejectWithValue }) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid,
          email: userData.email,
          subscriptionStatus: userData.subscriptionStatus || 'none',
          purchasedClasses: userData.purchasedClasses || []
        };
      }
      return rejectWithValue('User document not found');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  subscriptionStatus: 'none',
  purchasedClasses: []
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        state.subscriptionStatus = action.payload.subscriptionStatus || 'none';
        state.purchasedClasses = action.payload.purchasedClasses || [];
      } else {
        state.subscriptionStatus = 'none';
        state.purchasedClasses = [];
      }
    },
    updateSubscriptionStatus: (state, action: PayloadAction<SubscriptionStatus>) => {
      state.subscriptionStatus = action.payload;
    },
    addPurchasedClass: (state, action: PayloadAction<string>) => {
      if (!state.purchasedClasses.includes(action.payload)) {
        state.purchasedClasses.push(action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Register user
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.subscriptionStatus = action.payload.subscriptionStatus;
        state.purchasedClasses = action.payload.purchasedClasses;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Login user
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.subscriptionStatus = action.payload.subscriptionStatus;
        state.purchasedClasses = action.payload.purchasedClasses;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Google sign-in
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.subscriptionStatus = action.payload.subscriptionStatus;
        state.purchasedClasses = action.payload.purchasedClasses;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout user
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.subscriptionStatus = 'none';
        state.purchasedClasses = [];
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch user data
      .addCase(fetchUserData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.subscriptionStatus = action.payload.subscriptionStatus;
        state.purchasedClasses = action.payload.purchasedClasses;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Handle redirect result
      .addCase(handleRedirectResult.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(handleRedirectResult.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.subscriptionStatus = action.payload.subscriptionStatus;
          state.purchasedClasses = action.payload.purchasedClasses;
        }
      })
      .addCase(handleRedirectResult.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setUser, updateSubscriptionStatus, addPurchasedClass } = authSlice.actions;
export default authSlice.reducer;