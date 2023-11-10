import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyApzf5snsAOccmca3UFR25U1tuQcKv0QPk',
  authDomain: 'lifeloom-4708b.firebaseapp.com',
  projectId: 'lifeloom-4708b',
  storageBucket: 'lifeloom-4708b.appspot.com',
  messagingSenderId: '1016755450668',
  appId: '1:1016755450668:web:b71ae2ec9a6e490b76b289',
  measurementId: 'G-JLL88R61E0',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
