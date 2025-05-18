import { useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import type { Database } from '../types/supabase-types';

import styles from './Home.module.css';
import Hero from '../components/Hero';

type Recipe = Database['public']['Tables']['recipes']['Row'];

const Home = () => {
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [newRecipes, setNewRecipes] = useState<Recipe[]>([]);

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

  return (
    <>
      <Hero />
      <main className={styles.homePage}>
        <section>
          <h2 className={styles.sectionTitle}>Chef’s Picks 🔥</h2>
          <div className={styles.recipeGrid}>
            {popularRecipes.map((recipe) => (
              <div className={styles.recipeCard} key={recipe.id}>
                <div className={styles.imageContainer}>
                  <img
                    src={recipe.image_url ?? undefined}
                    alt={recipe.name}
                    className={styles.recipeImage}
                  />
                  <div className={styles.overlay}>
                    <h2 className={styles.recipeTitle}>{recipe.name}</h2>
                    <p className={styles.recipeDescription}>
                      {recipe.description}
                    </p>
                    <Link
                      to={`/rezepte/${recipe.id}`}
                      className={styles.detailsButton}
                    >
                      Zum Rezept
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>Fresh from the Kitchen 🍳</h2>
          <div className={styles.recipeGrid}>
            {newRecipes.map((recipe) => (
              <div className={styles.recipeCard} key={recipe.id}>
                <div className={styles.imageContainer}>
                  <img
                    src={recipe.image_url ?? undefined}
                    alt={recipe.name}
                    className={styles.recipeImage}
                  />
                  <div className={styles.overlay}>
                    <h2 className={styles.recipeTitle}>{recipe.name}</h2>
                    <Link
                      to={`/rezepte/${recipe.id}`}
                      className={styles.detailsButton}
                    >
                      Zum Rezept
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
