import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { supabaseClient } from '../lib/supabaseClient';
import '../components/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <>
      <div className="navbar-header">
        <button className="menu-button" onClick={() => setIsOpen(true)}>
          ☰
        </button>
        <Link to="/" className="logo">
          🍳 Die Rezeptwelt
        </Link>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="overlay" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button className="close-button" onClick={() => setIsOpen(false)}>
          ×
        </button>

        <NavLink
          className={({ isActive }) => (isActive ? 'active' : 'normal')}
          to="/"
          onClick={() => setIsOpen(false)}
        >
          Home
        </NavLink>
        <NavLink to="/rezepte" onClick={() => setIsOpen(false)}>
          Rezepte
        </NavLink>
        <NavLink to="/über-uns" onClick={() => setIsOpen(false)}>
          Über uns
        </NavLink>

        {!loading && !user && (
          <NavLink to="/login" onClick={() => setIsOpen(false)}>
            Login
          </NavLink>
        )}

        {!loading && user && (
          <>
            <NavLink to="/neues-rezept" onClick={() => setIsOpen(false)}>
              Neues Rezept
            </NavLink>
            <NavLink to="/profil" onClick={() => setIsOpen(false)}>
              Profil
            </NavLink>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default Navbar;
