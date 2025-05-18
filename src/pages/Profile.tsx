import { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabaseClient } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import type { Database } from '../types/supabase-types';
import EditProfileForm from './EditProfileForm';
import styles from '../pages/Profile.module.css';

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
        .single<ProfileRow>();

      if (error) {
        console.error('Fehler beim Laden des Profils:', error.message, error);
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
    <section className={styles.container}>
      <h1 className={styles.heading}>Profil</h1>

      <div className={styles.info}>
        <p>
          <span className={styles.label}>E-Mail:</span> {user.email}
        </p>
        <p>
          <span className={styles.label}>Vorname:</span>{' '}
          {profile.first_name ?? '-'}
        </p>
        <p>
          <span className={styles.label}>Nachname:</span>{' '}
          {profile.last_name ?? '-'}
        </p>
        <p>
          <span className={styles.label}>Zuletzt geändert:</span>{' '}
          {profile.updated_at
            ? new Date(profile.updated_at).toLocaleString()
            : '—'}
        </p>
        <p>
          <span className={styles.label}>Letzter Login:</span>{' '}
          {user.last_sign_in_at
            ? new Date(user.last_sign_in_at).toLocaleString()
            : '—'}
        </p>
      </div>

      <div className={styles.formWrapper}>
        <EditProfileForm />
      </div>

      <div className={styles.actions}>
        <button
          onClick={async () => {
            await supabaseClient.auth.signOut();
            navigate('/login');
          }}
          className={`${styles.button} ${styles.logout}`}
        >
          Abmelden
        </button>

        <button
          onClick={handleDeleteAccount}
          className={`${styles.button} ${styles.delete}`}
        >
          Account löschen
        </button>
      </div>
    </section>
  );
}
