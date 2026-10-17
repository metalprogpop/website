import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { EpisodesPage } from "./pages/EpisodesPage";
import { EpisodePage } from "./pages/EpisodePage";
import { FanCluPage } from "./pages/FanCluPage";
import { AboutPage } from "./pages/AboutPage";
import { LogoutPage } from "./pages/LogoutPage";
import { AdminPage } from "./pages/AdminPage";
import { ScrollToTop } from "./components/ScrollToTop";
import { Toaster } from "./components/ui/sonner";
import { MiniPlayer } from "./player/MiniPlayer";
import { PlayerProvider } from "./player/PlayerProvider";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/episodes" element={<EpisodesPage />} />
      <Route path="/episodes/:episodeRef" element={<EpisodePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/fan-clu" element={<FanCluPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PlayerProvider>
        <AppRoutes />
        <MiniPlayer />
      </PlayerProvider>
      {/* Top: the mini-player takes the bottom of the screen. */}
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}
