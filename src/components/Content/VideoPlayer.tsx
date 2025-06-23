import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import type { Tutorial } from '../../types';

interface VideoPlayerProps {
  tutorial?: Tutorial;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ tutorial }) => {
  if (!tutorial) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Tutorial not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {tutorial.title}
      </Typography>
      
      <Paper
        elevation={2}
        sx={{
          aspectRatio: '16/9',
          backgroundColor: 'grey.900',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <Typography variant="h6" gutterBottom>
            Video Player Placeholder
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Video URL: {tutorial.videoUrl}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          About This Tutorial
        </Typography>
        <Typography variant="body1" paragraph>
          {tutorial.description}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
          <Typography variant="body2">
            <strong>Duration:</strong> {tutorial.duration}
          </Typography>
          <Typography variant="body2">
            <strong>Level:</strong> {tutorial.level || tutorial.difficulty}
          </Typography>
          <Typography variant="body2">
            <strong>Access:</strong>{' '}
            {tutorial.accessType === 'free'
              ? 'Free'
              : tutorial.accessType === 'subscription'
              ? 'Premium Subscription'
              : `Individual Purchase ($${tutorial.price!})`}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoPlayer;