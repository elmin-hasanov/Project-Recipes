import { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabaseClient } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import type { Database } from '../types/supabase-types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export default function Profile() {
  const { user } = useUser();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name, created_at, updated_at')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Fehler beim Laden des Profils:', error.message);
      } else if (data) {
        setProfile(data);
      } else {
        console.warn('Kein Profil gefunden für User-ID:', user.id);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  if (!user || !profile) return <p>Lade Profildaten...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Profil</h2>
      <p>
        <strong>E-Mail:</strong> {user.email}
      </p>
      <p>
        <strong>Vorname:</strong> {profile.first_name ?? '-'}
      </p>
      <p>
        <strong>Nachname:</strong> {profile.last_name ?? '-'}
      </p>
      <p>
        <strong>Zuletzt geändert:</strong>{' '}
        {profile.updated_at
          ? new Date(profile.updated_at).toLocaleString()
          : '—'}
      </p>
      <p>
        <strong>Letzter Login:</strong>{' '}
        {user.last_sign_in_at
          ? new Date(user.last_sign_in_at).toLocaleString()
          : '—'}
      </p>
    </div>
  );
}
