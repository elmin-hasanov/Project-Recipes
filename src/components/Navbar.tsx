import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <Link to="/">🍳 Die Rezeptwelt</Link>
      <NavLink to="/">Home</NavLink>
      <NavLink to="/rezepte">Rezepte</NavLink>
      <NavLink to="/über-uns">Über uns</NavLink>
      <NavLink to="/login">Login</NavLink>
    </nav>
  );
};

export default Navbar;
