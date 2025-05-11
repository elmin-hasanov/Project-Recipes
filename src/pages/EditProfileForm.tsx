import { useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { useUser } from '../contexts/UserContext';

export default function EditProfileForm() {
  const { user } = useUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Kein Profil vorhanden – erstellen
        const { error: insertError } = await supabaseClient
          .from('profiles')
          .insert({ id: user.id });

        if (insertError) {
          setMessage(
            '❌ Fehler beim Anlegen des Profils: ' + insertError.message
          );
        } else {
          setFirstName('');
          setLastName('');
        }
      } else if (error) {
        setMessage('❌ Fehler beim Laden des Profils: ' + error.message);
      } else if (data) {
        setFirstName(data.first_name ?? '');
        setLastName(data.last_name ?? '');
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabaseClient
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      setMessage('❌ Fehler beim Speichern: ' + error.message);
    } else {
      setMessage('✅ Änderungen erfolgreich gespeichert!');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
      <h3>Profil bearbeiten</h3>
      <div>
        <label>Vorname:</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Nachname:</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <button type="submit">Speichern</button>
      {message && <p>{message}</p>}
    </form>
  );
}
