import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import {
  AccountCircle,
  Star,
  ShoppingCart,
  Email,
  DateRange,
  Settings,
} from '@mui/icons-material';
import { createCustomerPortalSession } from '../store/paymentSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, subscriptionStatus, purchasedClasses } = useSelector(
    (state) => state.auth
  );
  const { allTutorials } = useSelector((state) => state.content);
  const { isProcessingPayment } = useSelector((state) => state.payment);

  const handleManageSubscription = () => {
    dispatch(createCustomerPortalSession());
  };

  const getSubscriptionStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trialing':
        return 'info';
      case 'past_due':
        return 'warning';
      case 'canceled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSubscriptionStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active Premium Subscription';
      case 'trialing':
        return 'Trial Period';
      case 'past_due':
        return 'Payment Past Due';
      case 'canceled':
        return 'Subscription Canceled';
      case 'none':
        return 'No Active Subscription';
      default:
        return 'Unknown Status';
    }
  };

  const purchasedTutorials = allTutorials.filter((tutorial) =>
    purchasedClasses.includes(tutorial.id)
  );

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5">Please log in to view your profile</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        My Profile
      </Typography>

      <Grid container spacing={4}>
        {/* User Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AccountCircle sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h5">Account Information</Typography>
              </Box>

              {user.photoURL && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Box sx={{ width: 80, height: 80 }}>
                    <img
                      src={user.photoURL}
                      alt={user.displayName || user.email}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                </Box>
              )}

              {user.displayName && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccountCircle sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Display Name
                    </Typography>
                  </Box>
                  <Typography variant="body1">{user.displayName}</Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                </Box>
                <Typography variant="body1">{user.email}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DateRange sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    User ID
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {user.uid}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Subscription Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Star sx={{ fontSize: 40, mr: 2, color: 'secondary.main' }} />
                <Typography variant="h5">Subscription Status</Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  label={getSubscriptionStatusText(subscriptionStatus)}
                  color={getSubscriptionStatusColor(subscriptionStatus)}
                  size="large"
                  sx={{ mb: 2 }}
                />
                
                {subscriptionStatus === 'none' && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upgrade to premium to access exclusive content and advanced tutorials
                  </Typography>
                )}
                
                {subscriptionStatus === 'active' && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    You have access to all premium content
                  </Typography>
                )}

                {subscriptionStatus === 'active' && (
                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    onClick={handleManageSubscription}
                    disabled={isProcessingPayment}
                    size="small"
                  >
                    {isProcessingPayment ? 'Loading...' : 'Manage Subscription'}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Purchased Classes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ShoppingCart sx={{ fontSize: 40, mr: 2, color: 'success.main' }} />
                <Typography variant="h5">Purchased Classes</Typography>
              </Box>

              {purchasedTutorials.length > 0 ? (
                <List>
                  {purchasedTutorials.map((tutorial, index) => (
                    <React.Fragment key={tutorial.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={tutorial.title}
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                {tutorial.description}
                              </Typography>
                              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                <Chip
                                  label={tutorial.level}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                <Chip
                                  label={tutorial.duration}
                                  size="small"
                                  variant="outlined"
                                />
                                <Chip
                                  label={`$${tutorial.price}`}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < purchasedTutorials.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: 'background.default',
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    You haven't purchased any individual classes yet.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Browse our individual classes to find specialized content for your learning goals.
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Account Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, backgroundColor: 'primary.main', color: 'white' }}>
            <Typography variant="h6" gutterBottom>
              Account Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">
                    {subscriptionStatus === 'active' ? '∞' : '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Premium Videos Access
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">{purchasedClasses.length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Classes Purchased
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">
                    ${purchasedTutorials.reduce((sum, tutorial) => sum + tutorial.price, 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Spent
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;