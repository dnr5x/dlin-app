import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Subjects from './pages/Subjects.jsx'
import SubjectDetail from './pages/SubjectDetail.jsx'
import QuizPlayer from './pages/QuizPlayer.jsx'
import Focus from './pages/Focus.jsx'
import Exams from './pages/Exams.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  const location = useLocation()

  return (
    <Layout>
      {/* AnimatePresence drives the native-like page transitions. */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:id" element={<SubjectDetail />} />
          <Route path="/subjects/:id/take" element={<QuizPlayer />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  )
}
