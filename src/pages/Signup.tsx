import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseClient } from '../lib/supabaseClient';
import './Signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const { error } = await supabaseClient.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
        },
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({
        type: 'success',
        text: 'Registrierung erfolgreich. Bitte bestätige deine E-Mail.',
      });
      navigate('/login');
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    const { error } = await supabaseClient.auth.signInWithOAuth({ provider });
    if (error) {
      setMessage({
        type: 'error',
        text: 'OAuth Login fehlgeschlagen: ' + error.message,
      });
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Registrieren</h2>

      {message.text && (
        <p
          className={
            message.type === 'error' ? 'signup-error' : 'signup-success'
          }
        >
          {message.text}
        </p>
      )}

      <form onSubmit={handleSignup} className="signup-form">
        <input
          type="text"
          placeholder="Vorname"
          value={form.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          required
          className="signup-input"
        />
        <input
          type="text"
          placeholder="Nachname"
          value={form.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          required
          className="signup-input"
        />
        <input
          type="email"
          placeholder="E-Mail"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          required
          className="signup-input"
        />
        <input
          type="password"
          placeholder="Passwort"
          value={form.password}
          onChange={(e) => handleChange('password', e.target.value)}
          required
          className="signup-input"
        />
        <button type="submit" className="signup-button">
          Registrieren
        </button>
      </form>

      <hr className="signup-divider" />

      <p className="signup-text">Oder registriere dich mit:</p>
      <button
        onClick={() => handleOAuthLogin('google')}
        className="oauth-button google"
      >
        Google Login
      </button>
      {/* <button
        onClick={() => handleOAuthLogin('github')}
        className="oauth-button github"
      >
        GitHub Login
      </button> */}

      <p className="signup-text">
        Bereits registriert?{' '}
        <a href="/login" className="signup-link">
          Zum Login
        </a>
      </p>
    </div>
  );
}
