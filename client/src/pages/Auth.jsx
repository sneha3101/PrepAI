import { IoSparkles } from "react-icons/io5";
import{motion} from "motion/react";
import {FcGoogle} from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/prepai-logo.svg";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "");

const getGoogleAuthErrorMessage = (error) => {
  if (!navigator.onLine) {
    return "You are offline. Please connect to the internet and try Google sign-in again.";
  }

  if (error.code === "auth/popup-closed-by-user") {
    return "Google sign-in was cancelled before it finished.";
  }

  if (error.code === "auth/popup-blocked") {
    return "The Google sign-in popup was blocked. Please allow popups for this site and try again.";
  }

  if (error.code === "auth/network-request-failed" || error.code === "auth/internal-error") {
    return "Google sign-in could not reach Firebase. Check your internet connection and make sure Google sign-in is enabled in Firebase.";
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.request) {
    return "Signed in with Google, but the app server is not reachable. Start the backend and try again.";
  }

  return error.message || "Google sign-in failed. Please try again.";
};

function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleGoogleAuth=async()=>{
    try {
      if (!navigator.onLine) {
        setAuthError("You are offline. Please connect to the internet and try Google sign-in again.");
        return;
      }

      setLoading(true);
      setAuthError("");
      const response =await signInWithPopup(auth,provider)
      let User =response.user
      let name= User.displayName
      const email=User.email
      const result=await axios.post(`${SERVER_URL}/api/auth/google`,
        {name,email} ,{withCredentials:true})
        console.log(result.data)
        localStorage.setItem("prepai_user", JSON.stringify(result.data));
        navigate("/home")

    } catch (error) {
      const message = getGoogleAuthErrorMessage(error);
      console.error("Google sign-in failed:", message)
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  }

  
  return (
    <div className='w-full min-h-screen bg-[#0F172A] flex items-center justify-center px-6 py-20 text-[#E2E8F0]'>
      
      <motion.div
      initial={{opacity:0 ,y:-40}}
        animate={{opacity:1, y:0}}
        transition={{duration:1.05}}
      
       className='w-full max-w-md p-8 rounded-3xl bg-[#1E293B] shadow-2xl border border-slate-700'>
        
        <div className='flex items-center justify-center gap-3 mb-6'>
          
          <div className='bg-[#0F172A] p-1 rounded-lg ring-1 ring-emerald-400/30'>
            <img src={logo} alt="PrepAI" className="h-8 w-8 rounded-md object-contain" />
          </div>

          <h2 className='font-semibold text-lg'>PrepAI</h2>
        
        </div>
        <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4'>
          Continue with
          <span className='bg-[#0F172A] text-emerald-400 px-3 py-1 rounded-full inline-flex items-center gap-2 ring-1 ring-emerald-400/30'>
          <IoSparkles size={16}/>
          AI Smart Interview
          </span>
        </h1>
        <p className='text-slate-300 text-center text-sm md:text-base leading-relaxed mb-8'>
          Sign in to start AI-powered mock interviews,
          track your progress, and unlock detailed performance insights.
        </p>
        {authError && (
          <p className="mb-4 rounded-xl border border-red-400/30 bg-red-950/40 px-4 py-3 text-center text-sm text-red-200">
            {authError}
          </p>
        )}
        <motion.button
        onClick={handleGoogleAuth} 
        disabled={loading}
        whileHover={{opacity:0.9,scale:1.03}}
        whileTap={{opacity:1,scale:0.98}}       
        className="w-full flex items-center justify-center gap-3 py-3 bg-emerald-500 text-[#0F172A] rounded-full shadow-[0_12px_28px_rgba(34,197,94,0.22)] disabled:cursor-not-allowed disabled:opacity-70 hover:bg-sky-400">
          <FcGoogle size={20}/>
          {loading ? "Signing in..." : "Continue with Google"}
        </motion.button>
      </motion.div>
    </div>

  )
}

export default Auth;
