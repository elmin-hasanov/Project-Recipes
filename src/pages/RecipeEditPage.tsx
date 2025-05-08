import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabaseClient } from '../lib/supabaseClient';
import type { Database } from '../types/supabase-types';

type Recipe = Database['public']['Tables']['recipes']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

const RecipeEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form-Felder
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState<number>(1);
  const [instructions, setInstructions] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');

  // Hole Rezeptdaten
  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;

      const { data, error } = await supabaseClient
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Fehler beim Laden:', error.message);
        return;
      }

      setRecipe(data);
      setName(data.name);
      setDescription(data.description ?? '');
      setServings(data.servings ?? 1);
      setInstructions(data.instructions ?? '');
      setCategoryId(data.category_id ?? '');
      setLoading(false);
    };

    const fetchCategories = async () => {
      const { data, error } = await supabaseClient
        .from('categories')
        .select('*');

      if (!error && data) {
        setCategories(data);
      }
    };

    fetchRecipe();
    fetchCategories();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    const { error } = await supabaseClient
      .from('recipes')
      .update({
        name,
        description,
        servings,
        instructions,
        category_id: categoryId,
      })
      .eq('id', id);

    if (error) {
      alert('Fehler beim Speichern: ' + error.message);
    } else {
      navigate(`/rezepte/${id}`);
    }
  };

  if (loading) return <p>Lade Rezeptdaten...</p>;
  if (!recipe) return <p>Rezept nicht gefunden.</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto p-4">
      <h2 className="text-xl font-semibold">Rezept bearbeiten</h2>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
        className="w-full p-2 border rounded"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Beschreibung"
        className="w-full p-2 border rounded"
      />

      <input
        type="number"
        value={servings}
        onChange={(e) => setServings(Number(e.target.value))}
        min={1}
        className="w-full p-2 border rounded"
      />

      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Zubereitung"
        className="w-full p-2 border rounded"
      />

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        required
        className="w-full p-2 border rounded"
      >
        <option value="">Kategorie wählen</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Speichern
      </button>
    </form>
  );
};

export default RecipeEditPage;
