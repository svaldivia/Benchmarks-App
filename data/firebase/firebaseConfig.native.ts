import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCOzZsLX1BYviuwABFOSUn9KB3JUw-3nwc',
  authDomain: 'fit-benchmark-app.firebaseapp.com',
  projectId: 'fit-benchmark-app',
  storageBucket: 'fit-benchmark-app.firebasestorage.app',
  messagingSenderId: '940140176485',
  appId: '1:940140176485:web:dcc024aeb5cca37f26928c',
};

console.log('firebaseConfig native config');
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
