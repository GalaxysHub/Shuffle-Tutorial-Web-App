import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, CircularProgress, ButtonProps } from '@mui/material';
import { Google } from '@mui/icons-material';
import { signInWithGoogle, clearError } from '../../store/authSlice';
import type { RootState, AppDispatch } from '../../store';

interface GoogleSignInButtonProps extends Omit<ButtonProps, 'onClick'> {
  variant?: 'text' | 'outlined' | 'contained';
  fullWidth?: boolean;
  text?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
  variant = 'outlined', 
  fullWidth = true, 
  text = 'Continue with Google',
  ...buttonProps 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleGoogleSignIn = async (): Promise<void> => {
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
      {...buttonProps}
    >
      {isLoading ? 'Signing in...' : text}
    </Button>
  );
};

export default GoogleSignInButton;