import React, { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import EggIcon from '@mui/icons-material/Egg';
import OpacityIcon from '@mui/icons-material/Opacity';
import GrainIcon from '@mui/icons-material/Grain';
import BoltIcon from '@mui/icons-material/Bolt';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';

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

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
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
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="settings"
                  sx={{ mr: 2 }}
                >
                  <SettingsIcon />
                </IconButton>
                <Paper sx={{ padding: '5px', marginRight: '10px' }}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <GrainIcon />
                    <span>
                      Carbs: {carbs}g/{maxCarbs}g
                    </span>
                  </Box>
                </Paper>
                <Paper sx={{ padding: '5px', marginRight: '10px' }}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <OpacityIcon />
                    <span>
                      Fats: {fats}g/{maxFats}g
                    </span>
                  </Box>
                </Paper>
                <Paper sx={{ padding: '5px', marginRight: '10px' }}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <EggIcon />
                    <span>
                      Proteins: {proteins}g/{maxProteins}g
                    </span>
                  </Box>
                </Paper>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Paper sx={{ padding: '5px', marginRight: '10px' }}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <BoltIcon />
                    <span>Daily Calories: {Math.round(userCalorieCount)}</span>
                  </Box>
                </Paper>
                <Paper sx={{ padding: '5px', marginRight: '10px' }}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <DirectionsRunIcon />
                    <span>BMR: {Math.round(userBMR)}</span>
                  </Box>
                </Paper>
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
                    },
                    '& .MuiInputLabel-root': {
                      top: '-8px',
                    },
                  }}
                  InputLabelProps={{
                    style: {
                      top: 0,
                      left: 0,
                    },
                    shrink: true,
                  }}
                />
              </form>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
      {searchResults.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            marginTop: '20px',
          }}
        >
          {searchResults.map((item) => (
            <Paper key={item.id} sx={{ padding: '10px', width: '50%' }}>
              <h3>{item.name}</h3>
              {item.nutrition.nutrition &&
              item.nutrition.nutrition.caloricBreakdown ? (
                <div>
                  <p>
                    % Carbs:
                    {item.nutrition.nutrition.caloricBreakdown.percentCarbs ??
                      'N/A'}
                  </p>
                  <p>
                    % Fat:
                    {item.nutrition.nutrition.caloricBreakdown.percentFat ??
                      'N/A'}
                  </p>
                  <p>
                    % Protein:
                    {item.nutrition.nutrition.caloricBreakdown.percentProtein ??
                      'N/A'}
                  </p>
                </div>
              ) : (
                <p>Nutrition data not available</p>
              )}
            </Paper>
          ))}
        </div>
      )}
    </div>
  );
}
