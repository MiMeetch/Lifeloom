import React, { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import Slider from '@mui/material/Slider';

function valuetext(value) {
  return `${value}°C`;
}

export default function Dashboard() {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserName(userDoc.data().firstName);
        } else {
          console.log('No such document!');
        }
      } else {
        setUserName('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                flexGrow: 1,
              }}
            >
              <Box sx={{ width: 300 }}>
                <Slider
                  aria-label="Temperature"
                  defaultValue={30}
                  getAriaValueText={valuetext}
                  color="secondary"
                />
              </Box>
              <Box sx={{ width: 300 }}>
                <Slider
                  aria-label="Temperature"
                  defaultValue={30}
                  getAriaValueText={valuetext}
                  color="secondary"
                />
              </Box>
              <Box sx={{ width: 300 }}>
                <Slider
                  aria-label="Temperature"
                  defaultValue={30}
                  getAriaValueText={valuetext}
                  color="secondary"
                />
              </Box>
            </Box>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
      <h1>Hello, {userName}</h1>
    </div>
  );
}
