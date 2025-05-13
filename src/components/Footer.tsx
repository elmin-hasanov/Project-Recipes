import { Link } from 'react-router-dom';
import '../components/Footer.css';

export default function Footer() {
  return (
    <div className="footer">
      <Link to="/" className="logo">
        🍳 Die Rezeptwelt / Copyrigt 2025
      </Link>
    </div>
  );
}
