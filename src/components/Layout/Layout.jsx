import React from 'react';
import { Box, Container } from '@mui/material';
import CustomAppBar from './AppBar';

const Layout = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <CustomAppBar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;