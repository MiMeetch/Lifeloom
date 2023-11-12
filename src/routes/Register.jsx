import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        firstName: data.get('firstName'),
        lastName: data.get('lastName'),
        dob: data.get('dob'),
        weight: data.get('weight'),
        exercise: data.get('exercise'),
        heightfeet: data.get('heightfeet'),
        heightinches: data.get('heightinches'),
        email: email
      });

      navigate(`/dashboard/${user.uid}`);
    } catch (error) {
      console.error('Error signing up:', error.message);
    }
  };

  return (
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
          Sign Up
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DateField']}>
                  <DemoItem>
                    <DateField 
                      name="dob" 
                      id="dob" 
                      required 
                      fullWidth 
                      label="Date of birth"
                    />
                  </DemoItem>
                </DemoContainer>
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="weight"
                label="Weight(lbs)"
                name="weight"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="heightfeet"
                label="Height(feet)"
                name="heightfeet"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="heightinches"
                label="Height(inches)"
                name="heightinches"
              />
            </Grid>

            <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="select-label">Weekly Exercise</InputLabel>
              <Select
                required
                id="exercise"
                name="exercise"
                label="Weekly Exercise"
              >
                <MenuItem value="1.2">No exercise</MenuItem>
                <MenuItem value="1.375">1-2 Days</MenuItem>
                <MenuItem value="1.55">3-4 Days</MenuItem>
                <MenuItem value="1.725">5-6 Days</MenuItem>
              </Select>
            </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
