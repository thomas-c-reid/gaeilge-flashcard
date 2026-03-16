import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Play from './pages/Play'
import Complete from './pages/Complete'
import Request from './pages/Request'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pages with bottom nav */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/request" element={<Request />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Full-screen play experience — no Layout shell */}
        <Route path="/play/:setId" element={<Play />} />
        <Route path="/play/:setId/complete" element={<Complete />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
