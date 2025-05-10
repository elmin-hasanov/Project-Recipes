import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import About from './pages/About';
import RecipeDetails from './components/RecipeDetails';
import RecipeCreatePage from './pages/RecipeCreatePage';
import RecipeEditPage from './pages/RecipeEditPage';
import Footer from './components/Footer';

import { UserProvider } from './contexts/UserContext';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <UserProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rezepte" element={<Recipes />} />
          <Route path="/rezepte/:id" element={<RecipeDetails />} />
          <Route path="/über-uns" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/neues-rezept" element={<RecipeCreatePage />} />
          <Route path="/rezepte/:id/bearbeiten" element={<RecipeEditPage />} />
        </Routes>
        <Footer />
      </UserProvider>
    </Router>
  );
}

export default App;
