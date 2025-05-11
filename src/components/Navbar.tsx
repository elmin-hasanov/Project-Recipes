import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { supabaseClient } from '../lib/supabaseClient';

const Navbar = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="flex gap-4 p-4 items-center bg-gray-100 shadow-sm">
      <Link to="/" className="font-bold">
        🍳 Die Rezeptwelt
      </Link>
      <NavLink to="/">Home</NavLink>
      <NavLink to="/rezepte">Rezepte</NavLink>
      <NavLink to="/über-uns">Über uns</NavLink>

      {!loading && !user && (
        <>
          <NavLink to="/login">Login</NavLink>
        </>
      )}

      {!loading && user && (
        <>
          <NavLink to="/neues-rezept">Neues Rezept</NavLink>
          <NavLink to="/profil">Profil</NavLink>
          <button onClick={handleLogout} className="text-red-600">
            Logout
          </button>
        </>
      )}
    </nav>
  );
};

export default Navbar;
