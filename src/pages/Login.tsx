import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabaseClient } from '../lib/supabaseClient';
import { useUser } from '../contexts/UserContext';
import '../pages/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const { user, loading } = useUser();

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setPassword('');
      setErrorMessage('Login fehlgeschlagen: ' + error.message);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setErrorMessage(`Fehler bei ${provider} Login: ` + error.message);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Login</h1>
      {errorMessage && <p className="login-error">{errorMessage}</p>}

      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="login-input"
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="login-input"
        />
        <button type="submit" className="login-button">
          Einloggen
        </button>
      </form>

      <div className="login-divider" />

      <button
        onClick={() => handleOAuthLogin('google')}
        className="oauth-button google"
      >
        Mit Google einloggen
      </button>

      <p className="signup-text">
        Noch kein Konto?{' '}
        <Link to="/signup" className="signup-link">
          Registrieren
        </Link>
      </p>
    </div>
  );
};

export default Login;
