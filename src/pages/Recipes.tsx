import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabaseClient } from '../lib/supabaseClient';
import type { Database } from '../types/supabase-types';

type Recipe = Database['public']['Tables']['recipes']['Row'];

export default function RecipeListPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRecipes = async () => {
      const { data, error } = await supabaseClient
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fehler beim Laden der Rezepte:', error.message);
      } else if (data) {
        setRecipes(data);
      }
    };

    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="recipe-list-page">
      <h1 className="page-title">Alle Rezepte</h1>

      <input
        type="text"
        placeholder="Rezept suchen..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      {filteredRecipes.length > 0 ? (
        <ul className="recipe-list">
          {filteredRecipes.map((recipe) => (
            <li key={recipe.id} className="recipe-card">
              <Link to={`/rezepte/${recipe.id}`}>
                <h2>{recipe.name}</h2>
                {recipe.image_url && (
                  <img
                    src={recipe.image_url}
                    alt={recipe.name}
                    className="recipe-image"
                  />
                )}
                <p>{recipe.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Keine Rezepte gefunden.</p>
      )}
    </div>
  );
}
