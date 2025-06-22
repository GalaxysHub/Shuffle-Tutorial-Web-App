import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';

// Async thunk for user registration
export const registerUser = createAsyncThunk(
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

// Async thunk for Google sign-in
export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
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
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
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
export const logoutUser = createAsyncThunk(
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
export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (uid, { rejectWithValue }) => {
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

const initialState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  subscriptionStatus: 'none', // 'active', 'trialing', 'past_due', 'canceled', 'none'
  purchasedClasses: []
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
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
    updateSubscriptionStatus: (state, action) => {
      state.subscriptionStatus = action.payload;
    },
    addPurchasedClass: (state, action) => {
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
      });
  }
});

export const { clearError, setUser, updateSubscriptionStatus, addPurchasedClass } = authSlice.actions;
export default authSlice.reducer;