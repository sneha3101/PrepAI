import axios from 'axios'
import { Navigate, Routes, Route } from 'react-router-dom'
import Auth from './pages/Auth'
import Home from './pages/Home'
import InterviewLogin from './pages/InterviewLogin'
import InterviewPage from './pages/InterviewPage'
import InterviewReport from './pages/InterviewReport'
import InterviewHistory from './pages/InterviewHistory'
import Pricing from './pages/Pricing'
import './index.css'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice'

const ServerUrl = import.meta.env.VITE_SERVER_URL ?? (import.meta.env.DEV ? 'http://localhost:8000' : '')

const App = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(`${ServerUrl}/api/user/current-user`, {
          withCredentials: true,
        })
        dispatch(setUserData(result.data))
        console.log(result.data)
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))
      }
    }

    getUser()
  }, [dispatch])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/home" element={<Home />} />
      <Route path="/Homepage" element={<Navigate to="/home" replace />} />
      <Route path="/interview-login" element={<InterviewLogin />} />
      <Route path="/interview" element={<InterviewPage />} />
      <Route path="/interview-report" element={<InterviewReport />} />
      <Route path="/interview-history" element={<InterviewHistory />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  )
}

export default App
