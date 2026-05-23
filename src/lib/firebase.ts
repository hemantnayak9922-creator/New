import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB92QJvqnfVD7rr2oLFTrwMwjhDUCA1Sq0",
  authDomain: "earnxpro-40bfd.firebaseapp.com",
  databaseURL: "https://earnxpro-40bfd-default-rtdb.firebaseio.com",
  projectId: "earnxpro-40bfd",
  storageBucket: "earnxpro-40bfd.firebasestorage.app",
  messagingSenderId: "606299140688",
  appId: "1:606299140688:android:f2591fc4429f2c6a525755"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
