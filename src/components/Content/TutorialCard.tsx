import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import { PlayArrow, Lock, ShoppingCart } from '@mui/icons-material';
import { createOneTimeCheckoutSession } from '../../store/paymentSlice';
import type { Tutorial } from '../../types';
import type { RootState } from '../../store';
import type { AppDispatch } from '../../store';

interface TutorialCardProps {
  tutorial: Tutorial;
}

const TutorialCard: React.FC<TutorialCardProps> = ({ tutorial }) => {
  const { isAuthenticated, subscriptionStatus, purchasedClasses } = useSelector(
    (state: RootState) => state.auth
  );
  const { isProcessingPayment } = useSelector((state: RootState) => state.payment);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const canAccess = (): boolean => {
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

  const handleWatch = (): void => {
    if (canAccess()) {
      navigate(`/watch/${tutorial.id}`);
    } else if (!isAuthenticated) {
      navigate('/login');
    } else if (tutorial.accessType === 'subscription') {
      navigate('/subscribe');
    }
  };

  const handlePurchase = async (): Promise<void> => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await dispatch(createOneTimeCheckoutSession({
        classId: tutorial.id,
        priceId: tutorial.priceId!,
      }));
    } catch (error: any) {
      console.error('Purchase failed:', error);
    }
  };

  const getAccessButton = (): React.ReactNode => {
    if (canAccess()) {
      return (
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayArrow />}
          onClick={handleWatch}
          fullWidth
        >
          Watch Now
        </Button>
      );
    }

    if (!isAuthenticated) {
      return (
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Lock />}
          onClick={() => navigate('/login')}
          fullWidth
        >
          Login to Access
        </Button>
      );
    }

    if (tutorial.accessType === 'subscription') {
      return (
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Lock />}
          onClick={() => navigate('/subscribe')}
          fullWidth
        >
          Subscribe to Access
        </Button>
      );
    }

    if (tutorial.accessType === 'individual_purchase') {
      return (
        <Button
          variant="contained"
          color="primary"
          startIcon={<ShoppingCart />}
          onClick={handlePurchase}
          disabled={isProcessingPayment}
          fullWidth
        >
          {isProcessingPayment ? 'Processing...' : `Buy for $${tutorial.price!}`}
        </Button>
      );
    }

    return null;
  };

  const getAccessTypeChip = (): React.ReactNode => {
    switch (tutorial.accessType) {
      case 'free':
        return <Chip label="Free" color="success" size="small" />;
      case 'subscription':
        return <Chip label="Premium" color="primary" size="small" />;
      case 'individual_purchase':
        return <Chip label={`$${tutorial.price!}`} color="secondary" size="small" />;
      default:
        return null;
    }
  };

  const getLevelColor = (level: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="div"
          sx={{
            height: 200,
            backgroundColor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <PlayArrow sx={{ fontSize: 60, color: 'grey.400' }} />
          {!canAccess() && (
            <Lock
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'grey.600',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '50%',
                p: 0.5,
              }}
            />
          )}
        </CardMedia>
        
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            display: 'flex',
            gap: 1,
          }}
        >
          {getAccessTypeChip()}
          <Chip
            label={tutorial.level!}
            color={getLevelColor(tutorial.level!)}
            size="small"
          />
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="h3" gutterBottom>
          {tutorial.title}
        </Typography>
        
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ flexGrow: 1, mb: 2 }}
        >
          {tutorial.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Duration: {tutorial.duration}
          </Typography>
        </Box>

        {getAccessButton()}
      </CardContent>
    </Card>
  );
};

export default TutorialCard;