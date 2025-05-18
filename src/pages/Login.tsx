import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseClient } from '../lib/supabaseClient';
import '../pages/Login.css'; // Import your CSS file for styling

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage('Login fehlgeschlagen: ' + error.message);
    } else {
      navigate('/');
    }
  };

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    const { error } = await supabaseClient.auth.signInWithOAuth({ provider });
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

      {/* <button
        onClick={() => handleOAuthLogin('github')}
        className="oauth-button github"
      >
        Mit GitHub einloggen
      </button> */}

      <p className="signup-text">
        Noch kein Konto?{' '}
        <a href="/signup" className="signup-link">
          Registrieren
        </a>
      </p>
    </div>
  );
};

export default Login;
