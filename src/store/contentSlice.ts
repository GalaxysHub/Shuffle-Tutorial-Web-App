import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ContentState } from '../types';

// Mock tutorial data - in a real app, this would come from Firestore
const mockTutorials = [
  // Free tutorials
  {
    id: 'free-1',
    title: 'Basic Shuffle Steps',
    description: 'Learn the fundamental running man and T-step movements',
    videoUrl: 'https://example.com/video1',
    accessType: 'free',
    duration: '10:30',
    level: 'Beginner'
  },
  {
    id: 'free-2',
    title: 'Shuffle Stance and Posture',
    description: 'Master the proper stance for effective shuffling',
    videoUrl: 'https://example.com/video2',
    accessType: 'free',
    duration: '8:15',
    level: 'Beginner'
  },
  {
    id: 'free-3',
    title: 'Basic Rhythm Training',
    description: 'Develop your sense of rhythm for shuffle dancing',
    videoUrl: 'https://example.com/video3',
    accessType: 'free',
    duration: '12:00',
    level: 'Beginner'
  },
  // Subscription-gated content
  {
    id: 'premium-1',
    title: 'Advanced Running Man Variations',
    description: 'Take your running man to the next level with these variations',
    videoUrl: 'https://example.com/premium1',
    accessType: 'subscription',
    duration: '15:45',
    level: 'Intermediate'
  },
  {
    id: 'premium-2',
    title: 'Melbourne Shuffle Techniques',
    description: 'Learn authentic Melbourne shuffle moves and combinations',
    videoUrl: 'https://example.com/premium2',
    accessType: 'subscription',
    duration: '18:20',
    level: 'Intermediate'
  },
  {
    id: 'premium-3',
    title: 'Shuffle Dance Choreography',
    description: 'Full choreographed routine for intermediate shufflers',
    videoUrl: 'https://example.com/premium3',
    accessType: 'subscription',
    duration: '25:10',
    level: 'Advanced'
  },
  {
    id: 'premium-4',
    title: 'Advanced Footwork Patterns',
    description: 'Complex footwork combinations and transitions',
    videoUrl: 'https://example.com/premium4',
    accessType: 'subscription',
    duration: '20:30',
    level: 'Advanced'
  },
  // Individual purchase classes
  {
    id: 'class-1',
    title: 'Master Class: Competition Prep',
    description: 'Intensive training for shuffle dance competitions',
    videoUrl: 'https://example.com/class1',
    accessType: 'individual_purchase',
    priceId: 'price_1234567890',
    productId: 'prod_competition_prep',
    price: 29.99,
    duration: '45:00',
    level: 'Advanced'
  },
  {
    id: 'class-2',
    title: 'Shuffle Freestyle Workshop',
    description: 'Learn to freestyle and improvise your shuffle moves',
    videoUrl: 'https://example.com/class2',
    accessType: 'individual_purchase',
    priceId: 'price_0987654321',
    productId: 'prod_freestyle_workshop',
    price: 19.99,
    duration: '35:20',
    level: 'Intermediate'
  },
  {
    id: 'class-3',
    title: 'Shuffle Dance History & Culture',
    description: 'Deep dive into the origins and culture of shuffle dancing',
    videoUrl: 'https://example.com/class3',
    accessType: 'individual_purchase',
    priceId: 'price_1122334455',
    productId: 'prod_history_culture',
    price: 14.99,
    duration: '30:15',
    level: 'All Levels'
  }
];

// Async thunk to fetch tutorials (simulated - in real app would fetch from Firestore)
export const fetchTutorials = createAsyncThunk(
  'content/fetchTutorials',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockTutorials;
    } catch (error) {
      return rejectWithValue('Failed to fetch tutorials');
    }
  }
);

const initialState = {
  allTutorials: [],
  freeTutorials: [],
  premiumVideos: [],
  individualClasses: [],
  isLoading: false,
  error: null
} as any; // TODO: Fix state structure to match ContentState

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTutorials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTutorials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allTutorials = action.payload;
        state.freeTutorials = action.payload.filter(tutorial => tutorial.accessType === 'free');
        state.premiumVideos = action.payload.filter(tutorial => tutorial.accessType === 'subscription');
        state.individualClasses = action.payload.filter(tutorial => tutorial.accessType === 'individual_purchase');
      })
      .addCase(fetchTutorials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = contentSlice.actions;
export default contentSlice.reducer;