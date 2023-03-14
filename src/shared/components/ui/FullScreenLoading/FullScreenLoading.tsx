import { Box, CircularProgress, Typography } from '@mui/material';

export interface FullScreenLoadingProps {}

const FullScreenLoading: React.FC<FullScreenLoadingProps> = () => {
  return (
    <Box
      display="flex"
      sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
      justifyContent="center"
      alignItems="center"
      height="calc(100vh - 200px)"
    >
      <Typography>Loading...</Typography>

      <CircularProgress thickness={2} />
    </Box>
  );
};

export default FullScreenLoading;
