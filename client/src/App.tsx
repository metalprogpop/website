import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { EpisodesPage } from "./pages/EpisodesPage";
import { FanCluPage } from "./pages/FanCluPage";
import { LogoutPage } from "./pages/LogoutPage";
import { ScrollToTop } from "./components/ScrollToTop";

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/episodes" element={<EpisodesPage />} />
        <Route path="/fan-clu" element={<FanCluPage />} />
        <Route path="/logout" element={<LogoutPage />} />
      </Routes>
    </BrowserRouter>
  );
}
