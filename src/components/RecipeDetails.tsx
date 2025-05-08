import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { Recipe, Ingredient } from '../types/supabase-types';

interface FullRecipe extends Recipe {
  ingredients: Ingredient[];
  categories: { name: string } | null;
}

const RecipeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<FullRecipe | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;

      const { data, error } = await supabaseClient
        .from('recipes')
        .select(
          `
          *,
          ingredients (*),
          categories (name)
        `
        )
        .eq('id', id)
        .single();

      if (error) {
        console.error('Fehler beim Laden des Rezepts:', error);
      } else {
        setRecipe(data);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">{recipe.name}</h1>
      {recipe.image_url && (
        <img
          src={recipe.image_url}
          alt={recipe.name}
          className="w-full max-w-md mb-4 rounded"
        />
      )}
      <p className="mb-2">{recipe.description}</p>
      <p className="mb-2">Bewertung: {recipe.rating ?? 'Keine Bewertung'}/5</p>
      <p className="mb-2">
        Kategorie: {recipe.categories?.name ?? 'Unbekannt'}
      </p>

      <h3 className="mt-4 font-semibold">Zutaten</h3>
      <ul className="list-disc pl-5">
        {recipe.ingredients?.map((ing) => (
          <li key={ing.id}>
            {ing.quantity} {ing.unit} {ing.name}{' '}
            {ing.additionalInfo && `(${ing.additionalInfo})`}
          </li>
        ))}
      </ul>

      <h3 className="mt-4 font-semibold">Zubereitung</h3>
      <p>{recipe.instructions}</p>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => navigate(`/rezepte/${id}/bearbeiten`)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Bearbeiten
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Löschen
        </button>
      </div>
    </div>
  );
};

export default RecipeDetails;
