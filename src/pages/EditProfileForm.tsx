import { useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { useUser } from '../contexts/UserContext';
import { produce } from 'immer';
import styles from './EditProfileForm.module.css';

export default function EditProfileForm() {
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

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
        await supabaseClient.from('profiles').insert({ id: user.id });
      } else if (data) {
        setProfileData({
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
        });
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

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
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 className={styles.heading}>Profil bearbeiten</h3>

      <div className={styles.group}>
        <label htmlFor="first_name">Vorname</label>
        <input
          id="first_name"
          type="text"
          value={profileData.first_name}
          onChange={(e) => handleChange('first_name', e.target.value)}
          required
        />
      </div>

      <div className={styles.group}>
        <label htmlFor="last_name">Nachname</label>
        <input
          id="last_name"
          type="text"
          value={profileData.last_name}
          onChange={(e) => handleChange('last_name', e.target.value)}
          required
        />
      </div>

      <button type="submit" className={styles.button}>
        Speichern
      </button>

      {message && <p className={styles.message}>{message}</p>}
    </form>
  );
}
