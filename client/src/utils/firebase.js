
import { initializeApp } from "firebase/app";
import{getAuth,GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "prepai-64b7f.firebaseapp.com",
  projectId: "prepai-64b7f",
  storageBucket: "prepai-64b7f.firebasestorage.app",
  messagingSenderId: "253878369476",
  appId: "1:253878369476:web:f3729c36644ac83e605d91",
  measurementId: "G-3LT1H0HE8L"
};


const app = initializeApp(firebaseConfig);
const auth= getAuth(app);
const provider=new GoogleAuthProvider()

export {auth, provider}





