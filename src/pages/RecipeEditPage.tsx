import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabaseClient } from '../lib/supabaseClient';
import { useUser } from '../contexts/UserContext';
import type { Database } from '../types/supabase-types';

type Recipe = Database['public']['Tables']['recipes']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Ingredient = Database['public']['Tables']['ingredients']['Row'];

const RecipeEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState<number>(1);
  const [instructions, setInstructions] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');

  useEffect(() => {
    const fetchRecipeData = async () => {
      if (!id || !user) return;

      const { data: recipeData, error: recipeError } = await supabaseClient
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (recipeError || !recipeData) {
        console.error('Fehler beim Laden:', recipeError?.message);
        return;
      }

      if (recipeData.user_id !== user.id) {
        alert('Du darfst dieses Rezept nicht bearbeiten.');
        navigate('/rezepte');
        return;
      }

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

    fetchRecipeData();
  }, [id, user, navigate]);

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string | number
  ) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        id: '',
        name: '',
        quantity: 0,
        unit: '',
        additional_info: '',
        recipe_id: id!,
        created_at: null,
      },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

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

    if (updateError) {
      alert('Fehler beim Speichern: ' + updateError.message);
      return;
    }

    await supabaseClient.from('ingredients').delete().eq('recipe_id', id);

    const formattedIngredients = ingredients.map((ing) => ({
      ...ing,
      recipe_id: id,
    }));

    await supabaseClient.from('ingredients').insert(formattedIngredients);
    navigate(`/rezepte/${id}`);
  };

  if (loading) return <p>Lade Rezeptdaten...</p>;
  if (!recipe) return <p>Rezept nicht gefunden.</p>;

  return (
    <form onSubmit={handleSubmit} className="recipe-edit-form">
      <h2 className="form-title">Rezept bearbeiten</h2>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
        className="input"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Beschreibung"
        className="textarea"
      />

      <input
        type="number"
        value={servings}
        onChange={(e) => setServings(Number(e.target.value))}
        min={1}
        className="input"
      />

      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Zubereitung"
        className="textarea"
      />

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        required
        className="select"
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
            type="text"
            placeholder="Name"
            value={ing.name}
            onChange={(e) =>
              handleIngredientChange(index, 'name', e.target.value)
            }
            className="input"
          />
          <input
            type="number"
            placeholder="Menge"
            value={ing.quantity}
            onChange={(e) =>
              handleIngredientChange(
                index,
                'quantity',
                parseFloat(e.target.value)
              )
            }
            className="input"
          />
          <input
            type="text"
            placeholder="Einheit"
            value={ing.unit}
            onChange={(e) =>
              handleIngredientChange(index, 'unit', e.target.value)
            }
            className="input"
          />
          <input
            type="text"
            placeholder="Zusatzinfo"
            value={ing.additional_info || ''}
            onChange={(e) =>
              handleIngredientChange(index, 'additional_info', e.target.value)
            }
            className="input"
          />
          <button
            type="button"
            onClick={() => removeIngredient(index)}
            className="button delete"
          >
            Entfernen
          </button>
        </div>
      ))}
      <button type="button" onClick={addIngredient} className="button add">
        Zutat hinzufügen
      </button>

      <button type="submit" className="button submit">
        Speichern
      </button>
    </form>
  );
};

export default RecipeEditPage;
