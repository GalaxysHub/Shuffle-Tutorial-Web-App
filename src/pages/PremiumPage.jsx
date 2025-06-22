import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Button,
} from '@mui/material';
import { Star, Lock } from '@mui/icons-material';
import { fetchTutorials } from '../store/contentSlice';
import TutorialCard from '../components/Content/TutorialCard';

const PremiumPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { premiumVideos, isLoading, error } = useSelector((state) => state.content);
  const { isAuthenticated, subscriptionStatus } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchTutorials());
  }, [dispatch]);

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Lock sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Premium Content
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Please log in to access premium videos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/login')}
        >
          Login
        </Button>
      </Box>
    );
  }

  if (subscriptionStatus !== 'active' && subscriptionStatus !== 'trialing') {
    return (
      <Box>
        <Paper
          sx={{
            backgroundImage: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            color: 'white',
            py: 6,
            px: 4,
            mb: 4,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <Star sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom>
            Premium Videos
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Unlock advanced shuffle techniques and exclusive content
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/subscribe')}
            sx={{ minWidth: 200 }}
          >
            Subscribe Now
          </Button>
        </Paper>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            What you'll get with Premium:
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body1">
                  Advanced shuffle techniques and variations
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body1">
                  Exclusive choreography tutorials
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body1">
                  Competition preparation content
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body1">
                  Monthly new content releases
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body1">
                  HD video quality with multiple angles
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body1">
                  Cancel anytime
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Preview of locked content */}
        <Typography variant="h5" gutterBottom sx={{ opacity: 0.7 }}>
          Premium Content Preview
        </Typography>
        <Box sx={{ filter: 'blur(1px)', pointerEvents: 'none' }}>
          <Grid container spacing={3}>
            {premiumVideos.slice(0, 3).map((tutorial) => (
              <Grid item xs={12} sm={6} md={4} key={tutorial.id}>
                <TutorialCard tutorial={tutorial} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  }

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Premium Videos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to our premium content! You have access to all advanced tutorials and exclusive content.
        </Typography>
      </Box>

      {premiumVideos.length > 0 ? (
        <Grid container spacing={3}>
          {premiumVideos.map((tutorial) => (
            <Grid item xs={12} sm={6} md={4} key={tutorial.id}>
              <TutorialCard tutorial={tutorial} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No premium videos available at the moment.
        </Typography>
      )}
    </Box>
  );
};

export default PremiumPage;