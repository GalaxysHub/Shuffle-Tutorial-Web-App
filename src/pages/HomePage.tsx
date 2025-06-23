import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Button,
  Paper,
} from '@mui/material';
import { School, Star, PlayArrow } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchTutorials } from '../store/contentSlice';
import TutorialCard from '../components/Content/TutorialCard';
import type { RootState, AppDispatch } from '../store';

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { freeTutorials, isLoading, error } = useSelector((state: RootState) => state.content);
  const { isAuthenticated, subscriptionStatus } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchTutorials());
  }, [dispatch]);

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

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          px: 4,
          mb: 6,
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <School sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h2" component="h1" gutterBottom>
          Shuffle Dance Academy
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
          Master the art of shuffle dancing with our comprehensive tutorials
        </Typography>
        
        {!isAuthenticated ? (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              color="secondary"
              onClick={() => navigate('/register')}
              sx={{ minWidth: 140 }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ color: 'white', borderColor: 'white', minWidth: 140 }}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </Box>
        ) : subscriptionStatus !== 'active' ? (
          <Button
            variant="contained"
            size="large"
            color="secondary"
            startIcon={<Star />}
            onClick={() => navigate('/subscribe')}
            sx={{ minWidth: 180 }}
          >
            Go Premium
          </Button>
        ) : null}
      </Paper>

      {/* Features Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Why Choose Shuffle Dance Academy?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <PlayArrow sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Free Tutorials
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start learning with our comprehensive free tutorial library
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Star sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Premium Content
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Access advanced techniques and exclusive choreographies
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <School sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Expert Instruction
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Learn from professional shuffle dancers and instructors
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Free Tutorials Section */}
      <Box>
        <Typography variant="h4" gutterBottom>
          Free Tutorials
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Get started with these free shuffle dance tutorials - no account required!
        </Typography>

        {freeTutorials.length > 0 ? (
          <Grid container spacing={3}>
            {freeTutorials.map((tutorial) => (
              <Grid item xs={12} sm={6} md={4} key={tutorial.id}>
                <TutorialCard tutorial={tutorial} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No free tutorials available at the moment.
          </Typography>
        )}
      </Box>

      {/* Call to Action */}
      {!isAuthenticated && (
        <Paper
          sx={{
            mt: 8,
            p: 4,
            textAlign: 'center',
            backgroundColor: 'primary.main',
            color: 'white',
          }}
        >
          <Typography variant="h5" gutterBottom>
            Ready to take your shuffle skills to the next level?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Join thousands of dancers who have transformed their skills with our premium content
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/register')}
          >
            Start Your Journey
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default HomePage;