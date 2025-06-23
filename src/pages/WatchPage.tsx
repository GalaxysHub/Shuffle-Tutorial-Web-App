import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Alert, CircularProgress, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { fetchTutorials } from '../store/contentSlice';
import VideoPlayer from '../components/Content/VideoPlayer';
import type { RootState, AppDispatch } from '../store';
import type { Tutorial } from '../types';

const WatchPage: React.FC = () => {
  const { tutorialId } = useParams<{ tutorialId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { allTutorials, isLoading, error } = useSelector((state: RootState) => state.content);
  const { isAuthenticated, subscriptionStatus, purchasedClasses } = useSelector(
    (state: RootState) => state.auth
  );

  const tutorial: Tutorial | undefined = allTutorials.find((t) => t.id === tutorialId);

  useEffect(() => {
    if (allTutorials.length === 0) {
      dispatch(fetchTutorials());
    }
  }, [dispatch, allTutorials.length]);

  // Check if user can access this tutorial
  const canAccess = (): boolean => {
    if (!tutorial) return false;
    if (tutorial.accessType === 'free') return true;
    if (!isAuthenticated) return false;
    
    if (tutorial.accessType === 'subscription') {
      return subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
    }
    
    if (tutorial.accessType === 'individual_purchase') {
      return purchasedClasses.includes(tutorial.id);
    }
    
    return false;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!tutorial) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Tutorial not found
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </Box>
    );
  }

  if (!canAccess()) {
    const getAccessMessage = (): string => {
      if (!isAuthenticated) {
        return 'Please log in to access this content.';
      }
      if (tutorial?.accessType === 'subscription') {
        return 'This content requires an active subscription.';
      }
      if (tutorial?.accessType === 'individual_purchase') {
        return 'This content requires a one-time purchase.';
      }
      return 'You do not have access to this content.';
    };

    const getActionButton = (): React.ReactNode => {
      if (!isAuthenticated) {
        return (
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        );
      }
      if (tutorial?.accessType === 'subscription') {
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/subscribe')}
          >
            Subscribe
          </Button>
        );
      }
      if (tutorial?.accessType === 'individual_purchase') {
        return (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/classes')}
          >
            Purchase Class
          </Button>
        );
      }
      return null;
    };

    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          {getAccessMessage()}
        </Alert>
        <Box sx={{ mb: 4 }}>
          {getActionButton()}
        </Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>
      
      <VideoPlayer tutorial={tutorial} />
    </Box>
  );
};

export default WatchPage;