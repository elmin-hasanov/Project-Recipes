import { useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import RecipeCard from '../components/RecipeCard';
import type { Database } from '../types/supabase-types';

type Recipe = Database['public']['Tables']['recipes']['Row'];

const Home = () => {
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [newRecipes, setNewRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      // Beliebteste Rezepte (nach Bewertung)
      const { data: popular, error: popularError } = await supabaseClient
        .from('recipes')
        .select('*')
        .order('rating', { ascending: false })
        .limit(3);

      // Neueste Rezepte (nach Datum)
      const { data: recent, error: recentError } = await supabaseClient
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (popularError)
        console.error(
          'Fehler beim Laden der beliebtesten Rezepte:',
          popularError.message
        );
      if (recentError)
        console.error(
          'Fehler beim Laden der neuesten Rezepte:',
          recentError.message
        );

      setPopularRecipes(popular || []);
      setNewRecipes(recent || []);
    };

    fetchRecipes();
  }, []);

  return (
    <div className="home-page space-y-8">
      <section>
        <h2 className="section-title">Die beliebtesten Rezepte</h2>
        <div className="recipe-grid">
          {popularRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">Neueste Rezepte</h2>
        <div className="recipe-grid">
          {newRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
