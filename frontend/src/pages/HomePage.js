import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const HomePage = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Добро пожаловать в MusicUnity
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Ваш источник новой музыки и творческого сообщества
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage; 