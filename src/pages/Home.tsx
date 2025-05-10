import { useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import RecipeCard from '../components/RecipeCard';
import { Recipe } from '../types/supabase-types';

const Home = () => {
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [newRecipes, setNewRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      const { data: popular } = await supabaseClient
        .from('recipes')
        .select('*')
        .order('rating', { ascending: false })
        .limit(3);

      const { data: recent } = await supabaseClient
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      setPopularRecipes(popular || []);
      setNewRecipes(recent || []);
    };

    fetchRecipes();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm) return;
    const { data } = await supabaseClient
      .from('recipes')
      .select('*')
      .ilike('name', `%${searchTerm}%`);
    setSearchResults(data || []);
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <input
        type="text"
        placeholder="Rezept suchen..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Suchen</button>

      {searchTerm && searchResults.length === 0 && (
        <p>Keine Rezepte gefunden.</p>
      )}
      {searchTerm &&
        searchResults.map((r) => <RecipeCard key={r.id} recipe={r} />)}

      {!searchTerm && (
        <>
          <h2>Die beliebtesten Rezepte</h2>
          {popularRecipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}

          <h2>Neueste Rezepte</h2>
          {newRecipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </>
      )}
    </div>
  );
};

export default Home;
