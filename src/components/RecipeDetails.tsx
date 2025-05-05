import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

const RecipeDetails = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<any>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      const { data } = await supabaseClient
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

      setRecipe(data);
    };

    fetchRecipe();
  }, [id]);

  if (!recipe) return <p>Lade Rezept...</p>;

  return (
    <div>
      <h1>{recipe.name}</h1>
      <img src={recipe.image_url} alt={recipe.name} />
      <p>{recipe.description}</p>
      <p>Bewertung: {recipe.rating}/5</p>
      <p>Kategorie: {recipe.categories?.name}</p>
      <h3>Zutaten</h3>
      <ul>
        {recipe.ingredients?.map((ing: any) => (
          <li key={ing.id}>
            {ing.quantity} {ing.unit} {ing.name}
          </li>
        ))}
      </ul>
      <h3>Zubereitung</h3>
      <p>{recipe.instructions}</p>
    </div>
  );
};

export default RecipeDetails;
