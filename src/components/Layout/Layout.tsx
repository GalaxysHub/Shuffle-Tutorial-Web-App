import React, { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import CustomAppBar from './AppBar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <CustomAppBar />
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: 4,
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default Layout;