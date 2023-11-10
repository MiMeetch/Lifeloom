import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const defaultTheme = createTheme();

export default function BodyDataForm() {
  const [activityLevel, setActivityLevel] = useState('');
  const navigate = useNavigate();
  const { userId } = useParams();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const bodyData = {
      weight: data.get('weight'),
      height: data.get('height'),
      activityLevel: activityLevel,
    };

    try {
      const userBodyDataRef = doc(db, 'users', userId, 'bodyData', 'main');
      await updateDoc(userBodyDataRef, bodyData);

      navigate(`/dashboard/${userId}`);
    } catch (error) {
      console.error('Error updating body data:', error.message);
    }
  };

  const handleChange = (event) => {
    setActivityLevel(event.target.value);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Body Data Page
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="off"
                  name="weight"
                  required
                  fullWidth
                  id="weight"
                  label="Weight"
                  autoFocus
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="start">lbs</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="off"
                  name="height"
                  required
                  fullWidth
                  id="height"
                  label="Height"
                  autoFocus
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="start">in</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="activityLevel-label">
                    Activity Level
                  </InputLabel>
                  <Select
                    labelId="activityLevel-label"
                    id="activityLevel"
                    value={activityLevel}
                    label="Activity Level"
                    onChange={handleChange}
                  >
                    <MenuItem value={1.2}>Little or None</MenuItem>
                    <MenuItem value={1.375}>Light Exercise</MenuItem>
                    <MenuItem value={1.55}>Moderate Exercise</MenuItem>
                    <MenuItem value={1.725}>Heavy Exercise</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Calculate My Macros
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
