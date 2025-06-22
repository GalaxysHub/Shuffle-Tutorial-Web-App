import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Star,
  Check,
  PlayArrow,
  HighQuality,
  Update,
  Cancel,
} from '@mui/icons-material';
import { createSubscriptionCheckoutSession } from '../store/paymentSlice';

const SubscribePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, subscriptionStatus } = useSelector((state) => state.auth);
  const { isProcessingPayment, paymentError } = useSelector((state) => state.payment);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await dispatch(createSubscriptionCheckoutSession());
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" gutterBottom>
          Premium Subscription
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Please log in to subscribe to premium content
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

  if (subscriptionStatus === 'active') {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Star sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          You're Already Subscribed!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You have access to all premium content
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/premium')}
        >
          Access Premium Content
        </Button>
      </Box>
    );
  }

  const features = [
    'Access to all premium video tutorials',
    'Advanced shuffle techniques and variations',
    'Exclusive choreography content',
    'HD video quality with multiple camera angles',
    'Monthly new content releases',
    'Downloadable practice materials',
    'Priority customer support',
    'Cancel anytime',
  ];

  return (
    <Box>
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
        <Star sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h2" component="h1" gutterBottom>
          Go Premium
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
          Unlock the full potential of your shuffle dance journey
        </Typography>
      </Paper>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Card elevation={8} sx={{ position: 'relative', overflow: 'visible' }}>
            <Box
              sx={{
                position: 'absolute',
                top: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: 'secondary.main',
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 2,
                fontSize: '0.875rem',
                fontWeight: 'bold',
              }}
            >
              MOST POPULAR
            </Box>
            
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom>
                Premium Monthly
              </Typography>
              <Typography variant="h2" color="primary.main" gutterBottom>
                $19.99
                <Typography component="span" variant="h6" color="text.secondary">
                  /month
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Full access to all premium content
              </Typography>

              {paymentError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {paymentError}
                </Alert>
              )}

              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={isProcessingPayment}
                onClick={handleSubscribe}
                sx={{ mb: 4, py: 1.5 }}
              >
                {isProcessingPayment ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Start Subscription'
                )}
              </Button>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                What's included:
              </Typography>

              <List dense>
                {features.map((feature, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={feature}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Why Choose Premium?
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <PlayArrow sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Unlimited Access
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Watch all premium videos as many times as you want
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <HighQuality sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                High Quality
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enjoy HD videos with multiple camera angles for better learning
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Update sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Regular Updates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                New content added monthly to keep your skills fresh
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

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
        <Cancel sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Long-term Commitment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cancel your subscription anytime. No hidden fees, no questions asked.
        </Typography>
      </Paper>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          * Subscription will automatically renew monthly unless cancelled
        </Typography>
        <Typography variant="body2" color="text.secondary">
          * All prices are in USD and include applicable taxes
        </Typography>
      </Box>
    </Box>
  );
};

export default SubscribePage;