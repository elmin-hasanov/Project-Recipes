import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabaseClient } from '../lib/supabaseClient';
import { useUser } from '../contexts/UserContext';
import { produce } from 'immer';
import type { Database } from '../types/supabase-types';

type Recipe = Database['public']['Tables']['recipes']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Ingredient = Database['public']['Tables']['ingredients']['Row'];

const RecipeEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Lade Rezept, Zutaten und Kategorien
  useEffect(() => {
    if (!id || !user) return;

    const fetchData = async () => {
      const { data: recipeData, error: recipeError } = await supabaseClient
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (recipeError || !recipeData)
        return console.error(recipeError?.message);
      if (recipeData.user_id !== user.id) return navigate('/rezepte');

      const { data: ingredientData } = await supabaseClient
        .from('ingredients')
        .select('*')
        .eq('recipe_id', id);

      const { data: categoryData } = await supabaseClient
        .from('categories')
        .select('*');

      setRecipe(recipeData);
      setIngredients(ingredientData || []);
      setCategories(categoryData || []);
      setName(recipeData.name);
      setDescription(recipeData.description || '');
      setServings(recipeData.servings || 1);
      setInstructions(recipeData.instructions || '');
      setCategoryId(recipeData.category_id || '');
      setLoading(false);
    };

    fetchData();
  }, [id, user, navigate]);

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string | number
  ) => {
    setIngredients((prev) =>
      produce(prev, (draft) => {
        draft[index] = { ...draft[index], [field]: value };
      })
    );
  };

  const addIngredient = () => {
    setIngredients((prev) =>
      produce(prev, (draft) => {
        draft.push({
          id: '',
          name: '',
          quantity: 0,
          unit: '',
          additional_info: '',
          recipe_id: id!,
          created_at: null,
        });
      })
    );
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) =>
      produce(prev, (draft) => {
        draft.splice(index, 1);
      })
    );
  };

  // Rezept und Zutaten speichern
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const { error: updateError } = await supabaseClient
      .from('recipes')
      .update({
        name,
        description,
        servings,
        instructions,
        category_id: categoryId,
      })
      .eq('id', id);

    if (updateError) return alert('Fehler: ' + updateError.message);

    await supabaseClient.from('ingredients').delete().eq('recipe_id', id);
    const insertIngredients = ingredients.map(
      ({ name, quantity, unit, additional_info }) => ({
        name,
        quantity,
        unit,
        additional_info,
        recipe_id: id,
      })
    );

    const { error: insertError } = await supabaseClient
      .from('ingredients')
      .insert(insertIngredients);

    if (insertError) return alert('Fehler: ' + insertError.message);

    navigate(`/rezepte/${id}`);
  };

  if (loading) return <p>Lade Rezeptdaten...</p>;
  if (!recipe) return <p>Rezept nicht gefunden.</p>;

  return (
    <form onSubmit={handleSubmit} className="recipe-edit-form">
      <h2 className="form-title">Rezept bearbeiten</h2>

      <input
        className="input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
      />
      <textarea
        className="textarea"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Beschreibung"
      />
      <input
        className="input"
        type="number"
        value={servings}
        onChange={(e) => setServings(+e.target.value)}
        min={1}
      />
      <textarea
        className="textarea"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Zubereitung"
      />

      <select
        className="select"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        required
      >
        <option value="">Kategorie wählen</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <h3 className="section-title">Zutaten</h3>
      {ingredients.map((ing, index) => (
        <div key={index} className="ingredient-row">
          <input
            className="input"
            placeholder="Name"
            value={ing.name}
            onChange={(e) =>
              handleIngredientChange(index, 'name', e.target.value)
            }
          />
          <input
            className="input"
            type="number"
            placeholder="Menge"
            value={ing.quantity ?? ''}
            onChange={(e) =>
              handleIngredientChange(index, 'quantity', +e.target.value)
            }
          />
          <input
            className="input"
            placeholder="Einheit"
            value={ing.unit || ''}
            onChange={(e) =>
              handleIngredientChange(index, 'unit', e.target.value)
            }
          />
          <input
            className="input"
            placeholder="Zusatzinfo"
            value={ing.additional_info || ''}
            onChange={(e) =>
              handleIngredientChange(index, 'additional_info', e.target.value)
            }
          />
          <button
            type="button"
            className="button delete"
            onClick={() => removeIngredient(index)}
          >
            Entfernen
          </button>
        </div>
      ))}

      <button type="button" className="button add" onClick={addIngredient}>
        Zutat hinzufügen
      </button>
      <button type="submit" className="button submit">
        Speichern
      </button>
    </form>
  );
};

export default RecipeEditPage;
