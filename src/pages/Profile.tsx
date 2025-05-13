import { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabaseClient } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import type { Database } from '../types/supabase-types';
import EditProfileForm from './EditProfileForm';

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
      if (!user) return;

      const { data: profileData, error } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name, created_at, updated_at')
        .eq('id', user.id)
        .single<ProfileRow>(); // 💡 Typen explizit angeben

      if (error) {
        console.error('Fehler beim Laden des Profils:', error.message, error);
      } else if (!profileData) {
        console.warn('Kein Profil gefunden für User-ID:', user.id);
      } else {
        setProfile(profileData);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (
      !window.confirm(
        'Bist du sicher, dass du deinen Account dauerhaft löschen möchtest?'
      )
    )
      return;

    try {
      const { data: recipes } = await supabaseClient
        .from('recipes')
        .select('id')
        .eq('user_id', user.id);

      const recipeIds = recipes?.map((r) => r.id) ?? [];

      if (recipeIds.length > 0) {
        await supabaseClient
          .from('ingredients')
          .delete()
          .in('recipe_id', recipeIds);
        await supabaseClient.from('recipes').delete().eq('user_id', user.id);
      }

      await supabaseClient.from('profiles').delete().eq('id', user.id);
      await supabaseClient.auth.signOut();
      alert('Dein Account wurde gelöscht.');
      navigate('/');
    } catch (error) {
      console.error('Fehler beim Löschen des Accounts:', error);
      alert('Fehler beim Löschen. Bitte später erneut versuchen.');
    }
  };

  if (!user || !profile) return <p>Lade Profildaten...</p>;

  return (
    <div className="profile-page">
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

      <EditProfileForm />

      <hr className="divider" />

      <button onClick={handleDeleteAccount} className="delete-account-button">
        Account löschen
      </button>
    </div>
  );
}
