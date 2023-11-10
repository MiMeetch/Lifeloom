import React, { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Dashboard() {
  const [userName, setUserName] = useState('');

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

  return (
    <div>
      <h1>Hello, {userName}</h1>
    </div>
  );
}
