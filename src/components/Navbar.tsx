import { Link, NavLink } from 'react-router-dom';
// import { useSession } from '@supabase/auth-helpers-react';

const Navbar = () => {
  // const session = useSession();

  return (
    <nav className="flex gap-4 p-4">
      <Link to="/">🍳 Die Rezeptwelt</Link>
      <NavLink to="/">Home</NavLink>
      <NavLink to="/rezepte">Rezepte</NavLink>
      <NavLink to="/über-uns">Über uns</NavLink>
      <NavLink to="/login">Login</NavLink>
      {/* 
      {session && ( */}
      <Link to="/neues-rezept" className="text-blue-600">
        Neues Rezept
      </Link>
      {/* )} */}
    </nav>
  );
};

export default Navbar;
