import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabaseClient } from '../lib/supabaseClient';
import { useUser } from '../contexts/UserContext';

interface Category {
  id: string;
  name: string;
}

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  additional_info?: string;
}

const RecipeCreatePage = () => {
  const { id: recipeId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', quantity: 0, unit: '', additional_info: '' },
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabaseClient.from('categories').select('*');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!recipeId) return;
    const fetchRecipeAndIngredients = async () => {
      const { data: recipe } = await supabaseClient
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      const { data: ings } = await supabaseClient
        .from('ingredients')
        .select('*')
        .eq('recipe_id', recipeId);

      if (recipe) {
        if (recipe.user_id !== user?.id) {
          alert('Du darfst dieses Rezept nicht bearbeiten.');
          navigate('/');
          return;
        }

        setName(recipe.name);
        setDescription(recipe.description);
        setServings(recipe.servings);
        setInstructions(recipe.instructions);
        setCategoryId(recipe.category_id);
      }

      if (ings) {
        setIngredients(ings);
      }
    };

    fetchRecipeAndIngredients();
  }, [recipeId, user, navigate]);

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
      { name: '', quantity: 0, unit: '', additional_info: '' },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let recipe;
    if (recipeId) {
      const { data, error } = await supabaseClient
        .from('recipes')
        .update({
          name,
          description,
          servings,
          instructions,
          category_id: categoryId,
        })
        .eq('id', recipeId)
        .select()
        .single();

      if (error) return;
      recipe = data;

      await supabaseClient
        .from('ingredients')
        .delete()
        .eq('recipe_id', recipeId);
    } else {
      const { data, error } = await supabaseClient
        .from('recipes')
        .insert([
          {
            name,
            description,
            servings,
            instructions,
            category_id: categoryId,
            user_id: user?.id, // neu
          },
        ])
        .select()
        .single();

      if (error) return;
      recipe = data;
    }

    if (recipe) {
      const formattedIngredients = ingredients.map((ing) => ({
        ...ing,
        recipe_id: recipe.id,
      }));
      await supabaseClient.from('ingredients').insert(formattedIngredients);
      navigate(`/rezepte/${recipe.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto p-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Beschreibung"
      />
      <input
        type="number"
        value={servings}
        onChange={(e) => setServings(Number(e.target.value))}
        min={1}
      />
      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Anleitung"
      />

      <select
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

      <h4>Zutaten</h4>
      {ingredients.map((ing, index) => (
        <div key={index} className="border p-2 rounded space-y-2">
          <input
            type="text"
            placeholder="Name"
            value={ing.name}
            onChange={(e) =>
              handleIngredientChange(index, 'name', e.target.value)
            }
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
          />
          <input
            type="text"
            placeholder="Einheit"
            value={ing.unit}
            onChange={(e) =>
              handleIngredientChange(index, 'unit', e.target.value)
            }
          />
          <input
            type="text"
            placeholder="Zusatzinfo"
            value={ing.additional_info || ''}
            onChange={(e) =>
              handleIngredientChange(index, 'additional_info', e.target.value)
            }
          />
          <button type="button" onClick={() => removeIngredient(index)}>
            Entfernen
          </button>
        </div>
      ))}
      <button type="button" onClick={addIngredient}>
        Zutat hinzufügen
      </button>

      <button type="submit">Speichern</button>
    </form>
  );
};

export default RecipeCreatePage;
