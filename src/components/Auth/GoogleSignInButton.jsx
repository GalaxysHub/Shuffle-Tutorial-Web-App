import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, CircularProgress, Box } from '@mui/material';
import { Google } from '@mui/icons-material';
import { signInWithGoogle, clearError } from '../../store/authSlice';

const GoogleSignInButton = ({ variant = 'outlined', fullWidth = true, text = 'Continue with Google' }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleGoogleSignIn = async () => {
    dispatch(clearError());
    try {
      await dispatch(signInWithGoogle());
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  return (
    <Button
      variant={variant}
      fullWidth={fullWidth}
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      startIcon={
        isLoading ? (
          <CircularProgress size={20} />
        ) : (
          <Google />
        )
      }
      sx={{
        textTransform: 'none',
        py: 1.5,
        border: variant === 'outlined' ? '1px solid #dadce0' : undefined,
        color: variant === 'outlined' ? '#3c4043' : undefined,
        backgroundColor: variant === 'outlined' ? '#fff' : undefined,
        '&:hover': {
          backgroundColor: variant === 'outlined' ? '#f8f9fa' : undefined,
          border: variant === 'outlined' ? '1px solid #dadce0' : undefined,
        },
        '&:disabled': {
          backgroundColor: variant === 'outlined' ? '#f8f9fa' : undefined,
        }
      }}
    >
      {isLoading ? 'Signing in...' : text}
    </Button>
  );
};

export default GoogleSignInButton;