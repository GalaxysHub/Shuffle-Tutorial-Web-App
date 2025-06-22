import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { AccountCircle, ExitToApp } from '@mui/icons-material';
import { logoutUser } from '../../store/authSlice';

const CustomAppBar = () => {
  const { user, isAuthenticated, subscriptionStatus } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setAnchorEl(null);
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Shuffle Dance Academy
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" onClick={() => navigate('/')}>
            Free Tutorials
          </Button>
          
          {isAuthenticated && (
            <>
              <Button color="inherit" onClick={() => navigate('/premium')}>
                Premium Videos
                {subscriptionStatus === 'active' && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      px: 1,
                      py: 0.25,
                      bgcolor: 'success.main',
                      borderRadius: 1,
                      fontSize: '0.75rem',
                    }}
                  >
                    ACTIVE
                  </Box>
                )}
              </Button>
              
              <Button color="inherit" onClick={() => navigate('/classes')}>
                Individual Classes
              </Button>
              
              {subscriptionStatus !== 'active' && (
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={() => navigate('/subscribe')}
                  sx={{ ml: 1 }}
                >
                  Subscribe
                </Button>
              )}
            </>
          )}

          {isAuthenticated ? (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                {user?.photoURL ? (
                  <Avatar
                    src={user.photoURL}
                    alt={user.displayName || user.email}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {user?.displayName && (
                  <MenuItem disabled>
                    <Box>
                      <Typography variant="subtitle2">
                        {user.displayName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                )}
                <MenuItem onClick={() => handleNavigation('/profile')}>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => handleNavigation('/my-purchases')}>
                  My Purchases
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </div>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button
                color="secondary"
                variant="contained"
                onClick={() => navigate('/register')}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default CustomAppBar;