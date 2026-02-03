import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { EpisodesPage } from './pages/EpisodesPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/episodes" element={<EpisodesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
