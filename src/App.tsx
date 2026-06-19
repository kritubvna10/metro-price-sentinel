import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PovertyPenaltySection from './components/PovertyPenaltySection';
import FindingSection from './components/FindingSection';
import StorePremiumChart from './components/StorePremiumChart';
import CityFinderSection from './components/CityFinderSection';
import PersonaSection from './components/PersonaSection';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';

function Home(): React.JSX.Element {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <PovertyPenaltySection />
        <FindingSection />
        <StorePremiumChart />
        <CityFinderSection />
        <PersonaSection />
      </main>
      <Footer />
    </>
  );
}

const router = createBrowserRouter(
  [
    { path: '/', element: <Home /> },
    { path: '/dashboard', element: <Dashboard /> },
  ],
  { basename: import.meta.env.BASE_URL },
);

export default function App(): React.JSX.Element {
  return <RouterProvider router={router} />;
}
