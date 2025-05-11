import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseClient } from '../lib/supabaseClient';

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
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider,
    });

    if (error) {
      setErrorMessage(`Fehler bei ${provider} Login: ` + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Einloggen
        </button>
      </form>

      <hr className="my-6" />

      <button
        onClick={() => handleOAuthLogin('google')}
        className="w-full bg-red-500 text-white p-2 rounded mb-2"
      >
        Mit Google einloggen
      </button>

      <button
        onClick={() => handleOAuthLogin('github')}
        className="w-full bg-gray-800 text-white p-2 rounded"
      >
        Mit GitHub einloggen
      </button>

      <p className="mt-4">
        Noch kein Konto?{' '}
        <a href="/signup" className="text-blue-500">
          Registrieren
        </a>
      </p>
    </div>
  );
};

export default Login;
