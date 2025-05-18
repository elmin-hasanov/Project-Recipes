import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { useUser } from '../contexts/UserContext';
import styles from './RecipeDetails.module.css';

import type {
  Recipe,
  Ingredient,
  Profile,
  Category,
} from '../types/supabase-types';

interface FullRecipe extends Recipe {
  ingredients: Ingredient[];
  categories: Category | null;
  profiles: Profile | null;
}

const RecipeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<FullRecipe | null>(null);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;

      const { data, error } = await supabaseClient
        .from('recipes')
        .select(
          `
          id,
          name,
          description,
          instructions,
          servings,
          rating,
          image_url,
          user_id,
          created_at,
          ingredients (
            id,
            name,
            quantity,
            unit,
            additional_info
          ),
          categories (
            id,
            name
          ),
          profiles (
            id,
            first_name,
            last_name
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) {
        console.error('Fehler beim Laden des Rezepts:', error);
      } else {
        setRecipe(data as FullRecipe);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !recipe) return;

    const confirmed = window.confirm(
      'Möchtest du dieses Rezept wirklich löschen?'
    );
    if (!confirmed) return;

    const { error } = await supabaseClient
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Fehler beim Löschen des Rezepts.');
    } else {
      navigate('/');
    }
  };

  if (!recipe) return <p>Lade Rezept...</p>;

  const isOwner = user?.id === recipe.user_id;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{recipe.name}</h1>

      {recipe.image_url && (
        <img
          src={recipe.image_url}
          alt={recipe.name}
          className={styles.image}
        />
      )}

      <p className={styles.meta}>{recipe.description}</p>
      <p className={styles.meta}>Portionen: {recipe.servings}</p>
      <p className={styles.meta}>
        Bewertung: {recipe.rating ?? 'Keine Bewertung'}/5
      </p>
      <p className={styles.meta}>
        Kategorie: {recipe.categories?.name ?? 'Unbekannt'}
      </p>

      <h2 className={styles.sectionTitle}>Zutaten</h2>
      <ul className={styles.ingredientList}>
        {recipe.ingredients?.map((ing) => (
          <li key={ing.id}>
            {ing.quantity ?? '?'} {ing.unit ?? ''} {ing.name}
            {ing.additional_info && ` (${ing.additional_info})`}
          </li>
        ))}
      </ul>

      <h2 className={styles.sectionTitle}>Zubereitung</h2>
      <p className={styles.instructions}>{recipe.instructions}</p>

      {recipe.profiles && (
        <p className={styles.creator}>
          <strong>Erstellt von:</strong> {recipe.profiles.first_name ?? ''}{' '}
          {recipe.profiles.last_name ?? ''}
        </p>
      )}

      {isOwner && (
        <div className={styles.actions}>
          <button
            onClick={() => navigate(`/rezepte/${id}/bearbeiten`)}
            className={`${styles.button} ${styles.editButton}`}
          >
            Bearbeiten
          </button>
          <button
            onClick={handleDelete}
            className={`${styles.button} ${styles.deleteButton}`}
          >
            Löschen
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeDetails;
