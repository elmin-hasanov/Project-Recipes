import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import { supabaseClient } from '../lib/supabaseClient';

export default function LoginStatus() {
  const { user, loading } = useUser();

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    window.location.reload(); // Oder navigate, wenn du willst
  };

  if (loading) return null;

  return (
    <div style={{ marginLeft: 'auto' }}>
      {user ? (
        <>
          <span>{user.email}</span>
          <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>
            Logout
          </button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </div>
  );
}
