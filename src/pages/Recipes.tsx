import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabaseClient } from '../lib/supabaseClient';
import type { Database } from '../types/supabase-types';

import styles from '../pages/Recipes.module.css';

type Recipe = Database['public']['Tables']['recipes']['Row'];
type Ingredient = Database['public']['Tables']['ingredients']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

export default function RecipeListPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: recipes }, { data: ingredients }, { data: categories }] =
        await Promise.all([
          supabaseClient.from('recipes').select('*'),
          supabaseClient.from('ingredients').select('*'),
          supabaseClient.from('categories').select('*'),
        ]);

      if (recipes) setRecipes(recipes);
      if (ingredients) setIngredients(ingredients);
      if (categories) setCategories(categories);
    };

    fetchData();
  }, []);

  const filteredRecipes = recipes.filter((recipe) => {
    const nameMatch = recipe.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const categoryMatch =
      !selectedCategory || recipe.category_id === selectedCategory;

    const hasIngredient =
      !selectedIngredient ||
      ingredients.some(
        (ing) =>
          ing.recipe_id === recipe.id &&
          ing.name.toLowerCase().includes(selectedIngredient.toLowerCase())
      );

    return nameMatch && categoryMatch && hasIngredient;
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Alle Rezepte</h1>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="🔍 Suche nach Namen"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={styles.selectInput}
        >
          <option value="">Alle Kategorien</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="🔍 Nach Zutat filtern"
          value={selectedIngredient}
          onChange={(e) => setSelectedIngredient(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {filteredRecipes.length > 0 ? (
        <ul className={styles.recipeList}>
          {filteredRecipes.map((recipe) => (
            <li key={recipe.id} className={styles.recipeCard}>
              <Link to={`/rezepte/${recipe.id}`}>
                <h2 className={styles.recipeTitle}>{recipe.name}</h2>
                {recipe.image_url && (
                  <img
                    src={recipe.image_url}
                    alt={recipe.name}
                    className={styles.recipeImage}
                  />
                )}
                <p className={styles.recipeDescription}>{recipe.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.noResults}>Keine Rezepte gefunden.</p>
      )}
    </div>
  );
}
