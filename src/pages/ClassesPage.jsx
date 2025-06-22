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
import { ShoppingCart, School } from '@mui/icons-material';
import { fetchTutorials } from '../store/contentSlice';
import TutorialCard from '../components/Content/TutorialCard';

const ClassesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { individualClasses, isLoading, error } = useSelector((state) => state.content);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchTutorials());
  }, [dispatch]);

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <School sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Individual Classes
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Please log in to purchase individual classes
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
      <Paper
        sx={{
          backgroundImage: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
          color: 'white',
          py: 6,
          px: 4,
          mb: 4,
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <ShoppingCart sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Individual Classes
        </Typography>
        <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
          Purchase specific classes for lifetime access
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.8 }}>
          Perfect for focused learning on specific techniques or topics
        </Typography>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          How it works:
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                1. Choose Your Class
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Browse our selection of specialized classes
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                2. One-Time Payment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pay once and access your class forever
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                3. Lifetime Access
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Watch as many times as you want, whenever you want
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h4" gutterBottom>
        Available Classes
      </Typography>

      {individualClasses.length > 0 ? (
        <Grid container spacing={3}>
          {individualClasses.map((tutorial) => (
            <Grid item xs={12} sm={6} md={4} key={tutorial.id}>
              <TutorialCard tutorial={tutorial} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            No individual classes available at the moment. Check back soon!
          </Typography>
        </Box>
      )}

      <Paper
        sx={{
          mt: 6,
          p: 4,
          textAlign: 'center',
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Need help choosing?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Not sure which class is right for you? Consider our premium subscription for access to all content.
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate('/subscribe')}
        >
          View Subscription Options
        </Button>
      </Paper>
    </Box>
  );
};

export default ClassesPage;