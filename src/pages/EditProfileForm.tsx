import { useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { useUser } from '../contexts/UserContext';
import { produce } from 'immer';

export default function EditProfileForm() {
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Profil-Zustand initialisieren
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (error?.code === 'PGRST116' || error?.message.includes('no rows')) {
        // Profil automatisch anlegen
        await supabaseClient.from('profiles').insert({ id: user.id });
      } else if (data) {
        // Profil-Daten setzen
        setProfileData({
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
        });
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  // Eingaben aktualisieren mit immer
  const handleChange = (field: keyof typeof profileData, value: string) => {
    setProfileData((prev) =>
      produce(prev, (draft) => {
        draft[field] = value;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabaseClient
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      setMessage('❌ Fehler beim Speichern: ' + error.message);
    } else {
      setMessage('✅ Änderungen erfolgreich gespeichert!');
    }
  };

  if (loading) return <p>Profildaten werden geladen...</p>;

  return (
    <form onSubmit={handleSubmit} className="edit-profile-form">
      <h3>Profil bearbeiten</h3>

      <label>
        Vorname:
        <input
          type="text"
          value={profileData.first_name}
          onChange={(e) => handleChange('first_name', e.target.value)}
          required
        />
      </label>

      <label>
        Nachname:
        <input
          type="text"
          value={profileData.last_name}
          onChange={(e) => handleChange('last_name', e.target.value)}
          required
        />
      </label>

      <button type="submit">Speichern</button>
      {message && <p className="form-message">{message}</p>}
    </form>
  );
}
