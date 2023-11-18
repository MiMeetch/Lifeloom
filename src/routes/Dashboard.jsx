import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import InputAdornment from '@mui/material/InputAdornment';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import EggIcon from '@mui/icons-material/Egg';
import OpacityIcon from '@mui/icons-material/Opacity';
import GrainIcon from '@mui/icons-material/Grain';
import BoltIcon from '@mui/icons-material/Bolt';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import './dashboard.css';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';

const API_KEY = '08b52ab823f74e3baa0824b66e42a0ac';

export default function Dashboard() {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const [proteins, setProteins] = useState(0);
  const [maxCarbs, setMaxCarbs] = useState(0);
  const [maxFats, setMaxFats] = useState(0);
  const [maxProteins, setMaxProteins] = useState(0);
  const [userWeight, setUserWeight] = useState(0);
  const [userHeight, setUserHeight] = useState(0);
  const [userBirthday, setUserBirthday] = useState('');
  const [userAge, setUserAge] = useState(0);
  const [userBMR, setUserBMR] = useState(0);
  const [userExercise, setUserExercise] = useState(0);
  const [userCalorieCount, setUserCalorieCount] = useState(0);
  const [isSettingsBoxVisible, setIsSettingsBoxVisible] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [groceryList, setGroceryList] = useState([]);
  const [isGroceryListVisible, setIsGroceryListVisible] = useState(false);

  const navigate = useNavigate();

  const calculateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const weight = userDoc.data().weight;
          const height =
            userDoc.data().heightfeet * 12 + userDoc.data().heightinches;
          const dob = userDoc.data().dob;
          const age = calculateAge(dob);
          const exercise = userDoc.data().exercise;

          setUserExercise(exercise);
          setUserHeight(height);
          setUserBirthday(dob);
          setUserAge(age);
          setUserBMR(655 + 4.35 * weight + 4.7 * height - 4.7 * age);
        } else {
          console.log('Document does not exist!');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userWeight && userHeight && userAge) {
      setUserBMR(655 + 4.35 * userWeight + 4.7 * userHeight - 4.7 * userAge);
    }
  }, [userWeight, userHeight, userAge]);

  useEffect(() => {
    if (userBMR && userExercise) {
      setUserCalorieCount(userBMR * userExercise);
    }
  }, [userBMR, userExercise]);

  useEffect(() => {
    if (userCalorieCount) {
      setMaxCarbs(Math.round((userCalorieCount * 0.3) / 4));
      setMaxFats(Math.round((userCalorieCount * 0.3) / 9));
      setMaxProteins(Math.round((userCalorieCount * 0.4) / 4));
    }
  }, [userCalorieCount]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchInput(event.target.value);
  };

  const fetchNutritionFacts = async (id) => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/food/ingredients/${id}/information?amount=1&apiKey=${API_KEY}`
      );
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error fetching nutrition facts: ', error);
      return null;
    }
  };

  const searchIngredients = async () => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/food/ingredients/search?query=${searchInput}&apiKey=${API_KEY}`
      );
      const data = await response.json();

      const resultsWithNutrition = await Promise.all(
        data.results.map(async (item) => {
          const nutritionData = await fetchNutritionFacts(item.id);
          return { ...item, nutrition: nutritionData };
        })
      );

      setSearchResults(resultsWithNutrition);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    searchIngredients();
  };

  const nutrientAmount = (item, nutrientName) => {
    if (
      item.nutrition.nutrition &&
      item.nutrition.nutrition.nutrients &&
      Array.isArray(item.nutrition.nutrition.nutrients)
    ) {
      const nutrient = item.nutrition.nutrition.nutrients.find(
        (n) => n.name === nutrientName
      );
      return nutrient ? nutrient.amount.toFixed(2) : 'N/A';
    } else {
      return 'N/A';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const weight = parseFloat(data.get('weight'));
    const exercise = parseFloat(data.get('exercise'));

    try {
      const user = auth.currentUser;

      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          weight: weight,
          exercise: exercise,
        });

        setUserWeight(weight);
        setUserExercise(exercise);

        console.log('User updated successfully');
        handleSnackbarOpen();
      } else {
        console.error('User not found.');
      }
    } catch (error) {
      console.error('Error updating user information:', error.message);
    }
  };

  const handleSnackbarOpen = () => {
    setIsSnackbarOpen(true);
  };

  const addToGroceryList = (item) => {
    setGroceryList((prevList) => [...prevList, item]);
    setCarbs(carbs + parseFloat(nutrientAmount(item, 'Carbohydrates')));
    setFats(fats + parseFloat(nutrientAmount(item, 'Fat')));
    setProteins(proteins + parseFloat(nutrientAmount(item, 'Protein')));
  };

  const removeFromGroceryList = (index) => {
    const itemToRemove = groceryList[index];

    setCarbs(carbs - parseFloat(nutrientAmount(itemToRemove, 'Carbohydrates')));
    setFats(fats - parseFloat(nutrientAmount(itemToRemove, 'Fat')));
    setProteins(proteins - parseFloat(nutrientAmount(itemToRemove, 'Protein')));

    setGroceryList(groceryList.filter((_, i) => i !== index));
  };

  return (
    <div>
      <AppBar position="sticky" sx={{ zIndex: 2 }}>
        <Toolbar>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={() => setIsSettingsBoxVisible(!isSettingsBoxVisible)}
                size="large"
                edge="start"
                color="inherit"
                aria-label="settings"
                sx={{ mr: 2 }}
              >
                <SettingsIcon />
              </IconButton>
              <Paper
                sx={{
                  padding: '5px',
                  marginRight: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '10px',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <GrainIcon />
                  <span>
                    Carbs: {Math.round(carbs)}/{maxCarbs}g
                  </span>
                </Box>
              </Paper>
              <Paper
                sx={{
                  padding: '5px',
                  marginRight: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '10px',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <OpacityIcon />
                  <span>
                    Fats: {Math.round(fats)}/{maxFats}g
                  </span>
                </Box>
              </Paper>
              <Paper
                sx={{
                  padding: '5px',
                  marginRight: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '10px',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <EggIcon />
                  <span>
                    Proteins: {Math.round(proteins)}/{maxProteins}g
                  </span>
                </Box>
              </Paper>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Paper
                sx={{
                  padding: '5px',
                  marginRight: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '10px',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <BoltIcon />
                  <span>Daily Calories: {Math.round(userCalorieCount)}</span>
                </Box>
              </Paper>
              <Paper
                sx={{
                  padding: '5px',
                  marginRight: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '10px',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <DirectionsRunIcon />
                  <span>BMR: {Math.round(userBMR)}</span>
                </Box>
              </Paper>
              <IconButton
                onClick={() => setIsGroceryListVisible(!isGroceryListVisible)}
              >
                <ListAltIcon style={{ color: 'white' }} />
              </IconButton>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              minWidth: 375,
            }}
          >
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                label="Search Ingredients"
                id="search"
                value={searchInput}
                onChange={handleSearchChange}
                sx={{
                  '& .MuiInputBase-input': {
                    padding: '8px 10px',
                    fontSize: '0.875rem',
                    color: 'white',
                    borderColor: 'white',
                  },
                  '& .MuiInputLabel-root': {
                    top: '-8px',
                  },
                }}
                InputLabelProps={{
                  style: {
                    top: 0,
                    left: 0,
                    color: 'white',
                  },
                  shrink: true,
                }}
              />
            </form>
          </Box>
        </Toolbar>
      </AppBar>
      <Paper />
      <aside
        className={`settings-box ${isSettingsBoxVisible ? 'visible' : ''}`}
      >
        {
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
              sx={{
                marginTop: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography component="h1" variant="h5">
                Body Metrics
              </Typography>
              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{ mt: 3 }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="weight"
                      label="Weight(lbs)"
                      name="weight"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MonitorWeightIcon />
                          </InputAdornment>
                        ),
                      }}
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
                        startAdornment={
                          <InputAdornment position="start">
                            <FitnessCenterIcon />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="1.2">No exercise</MenuItem>
                        <MenuItem value="1.375">1-2 Days</MenuItem>
                        <MenuItem value="1.55">3-4 Days</MenuItem>
                        <MenuItem value="1.725">5-6 Days</MenuItem>
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
                  Update
                </Button>
              </Box>
            </Box>
          </Container>
        }
        <Snackbar
          open={isSnackbarOpen}
          autoHideDuration={5000}
          onClose={() => setIsSnackbarOpen(false)}
          TransitionComponent={Slide}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={() => setIsSnackbarOpen(false)}
            severity="success"
            style={{ marginBottom: '100px' }}
          >
            Updated successfully!
          </MuiAlert>
        </Snackbar>
        <span
          className="close-button"
          onClick={() => setIsSettingsBoxVisible(false)}
          style={{ fontSize: '30px', cursor: 'pointer' }}
        >
          X
        </span>
      </aside>
      {searchResults.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px',
            marginTop: '5px',
          }}
        >
          {searchResults.map((item) => (
            <Paper
              key={item.id}
              sx={{
                width: '50%',
                padding: '5px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                marginTop: '5px',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  marginRight: 4,
                }}
              >
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </h3>
              {item.nutrition.nutrition &&
              item.nutrition.nutrition.nutrients ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      marginRight: 4,
                    }}
                  >
                    Calories:
                    {' ' + Math.round(nutrientAmount(item, 'Calories'))}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      marginRight: 4,
                    }}
                  >
                    Carbs:
                    {' ' + Math.round(nutrientAmount(item, 'Carbohydrates'))}g
                  </p>
                  <p
                    style={{
                      margin: 0,
                      marginRight: 4,
                    }}
                  >
                    Fats:
                    {' ' + Math.round(nutrientAmount(item, 'Fat'))}g
                  </p>
                  <p
                    style={{
                      margin: 0,
                      marginRight: 4,
                    }}
                  >
                    Protein:
                    {' ' + Math.round(nutrientAmount(item, 'Protein'))}g
                  </p>
                </div>
              ) : (
                <p>Nutrition data not available</p>
              )}
              <Button onClick={() => addToGroceryList(item)}>
                Add to Food List
              </Button>
            </Paper>
          ))}
        </div>
      )}
      <aside
        className={`grocery-list ${isGroceryListVisible ? 'visible' : ''}`}
        style={{ padding: '10px' }}
      >
        <Paper
          sx={{
            padding: '5px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '10px',
            backgroundColor: '#CBB08B',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              justifyContent: 'center',
            }}
          >
            <LocalGroceryStoreIcon />
            <span>Grocery List</span>
          </Box>
        </Paper>
        {groceryList.map((item, index) => (
          <Paper
            key={index}
            sx={{
              padding: '5px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              borderRadius: '10px',
              backgroundColor: '#CBB08B',
              marginTop: '10px',
            }}
          >
            <h3
              style={{
                margin: 0,
              }}
            >
              {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                padding: 0,
                justifyContent: 'space-between',
              }}
            >
              <p
                style={{
                  margin: 0,
                  marginRight: 4,
                }}
              >
                Carbs: {Math.round(nutrientAmount(item, 'Carbohydrates'))}g
              </p>
              <p
                style={{
                  margin: 0,
                  marginRight: 4,
                }}
              >
                Fat: {Math.round(nutrientAmount(item, 'Fat'))}g
              </p>
              <p
                style={{
                  margin: 0,
                  marginRight: 4,
                }}
              >
                Protein: {Math.round(nutrientAmount(item, 'Protein'))}g
              </p>
            </div>
            <Button onClick={() => removeFromGroceryList(index)}>Remove</Button>
          </Paper>
        ))}
      </aside>
    </div>
  );
}
