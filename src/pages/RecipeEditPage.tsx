import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabaseClient } from '../lib/supabaseClient';
import { useUser } from '../contexts/UserContext';
import { produce } from 'immer';
import type { Database } from '../types/supabase-types';
import styles from './RecipeEditPage.module.css';

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    const fetchData = async () => {
      const { data: recipeData } = await supabaseClient
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (!recipeData || recipeData.user_id !== user.id)
        return navigate('/rezepte');

      const [{ data: ingredientData }, { data: categoryData }] =
        await Promise.all([
          supabaseClient.from('ingredients').select('*').eq('recipe_id', id),
          supabaseClient.from('categories').select('*'),
        ]);

      setRecipe(recipeData);
      setIngredients(ingredientData || []);
      setCategories(categoryData || []);
      setName(recipeData.name);
      setDescription(recipeData.description || '');
      setServings(recipeData.servings || 1);
      setInstructions(recipeData.instructions || '');
      setCategoryId(recipeData.category_id || '');
      setImageUrl(recipeData.image_url || null);
      setLoading(false);
    };

    fetchData();
  }, [id, user, navigate]);

  const uploadImage = async (file: File): Promise<string> => {
    const path = `recipes/${user!.id}-${Date.now()}-${file.name}`;
    const { error } = await supabaseClient.storage
      .from('recipe-images')
      .upload(path, file, { contentType: file.type, upsert: true });

    if (error) throw new Error(error.message);
    const { data } = supabaseClient.storage
      .from('recipe-images')
      .getPublicUrl(path);
    return data.publicUrl;
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    let finalImageUrl = imageUrl;

    if (imageFile && user) {
      try {
        finalImageUrl = await uploadImage(imageFile);
        setImageUrl(finalImageUrl);
      } catch (err) {
        return alert('Bild-Upload fehlgeschlagen: ' + err);
      }
    }

    const { error: updateError } = await supabaseClient
      .from('recipes')
      .update({
        name,
        description,
        servings,
        instructions,
        category_id: categoryId,
        image_url: finalImageUrl,
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
    <form onSubmit={handleSubmit} className={styles.container}>
      <h2 className={styles.title}>Rezept bearbeiten</h2>

      <input
        className={styles.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
      />
      <textarea
        className={styles.textarea}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Beschreibung"
      />
      <input
        className={styles.input}
        type="number"
        value={servings}
        onChange={(e) => setServings(+e.target.value)}
        min={1}
      />
      <textarea
        className={styles.textarea}
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Zubereitung"
      />

      <select
        className={styles.select}
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

      <label htmlFor="image" className={styles.fileLabel}>
        📷 Bild ersetzen
      </label>
      <input
        id="image"
        type="file"
        accept="image/*"
        className={styles.fileInput}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setImageFile(file);
            setImageUrl(URL.createObjectURL(file));
          }
        }}
      />

      {imageUrl && (
        <>
          <img src={imageUrl} alt="Vorschau" className={styles.imagePreview} />
          <button
            type="button"
            onClick={() => {
              setImageFile(null);
              setImageUrl(null);
            }}
            className={styles.removeImageButton}
          >
            Bild entfernen
          </button>
        </>
      )}

      <h3 className={styles.sectionTitle}>Zutaten</h3>
      {ingredients.map((ing, index) => (
        <div key={index} className={styles.ingredientRow}>
          <input
            className={styles.input}
            placeholder="Name"
            value={ing.name}
            onChange={(e) =>
              handleIngredientChange(index, 'name', e.target.value)
            }
          />
          <input
            className={styles.input}
            type="number"
            placeholder="Menge"
            value={ing.quantity ?? ''}
            onChange={(e) =>
              handleIngredientChange(index, 'quantity', +e.target.value)
            }
          />
          <input
            className={styles.input}
            placeholder="Einheit"
            value={ing.unit || ''}
            onChange={(e) =>
              handleIngredientChange(index, 'unit', e.target.value)
            }
          />
          <input
            className={styles.input}
            placeholder="Zusatzinfo"
            value={ing.additional_info || ''}
            onChange={(e) =>
              handleIngredientChange(index, 'additional_info', e.target.value)
            }
          />
          <button
            type="button"
            className={styles.delete}
            onClick={() => removeIngredient(index)}
          >
            Entfernen
          </button>
        </div>
      ))}

      <button
        type="button"
        className={`${styles.button} ${styles.add}`}
        onClick={addIngredient}
      >
        Zutat hinzufügen
      </button>
      <button type="submit" className={`${styles.button} ${styles.submit}`}>
        Speichern
      </button>
    </form>
  );
};

export default RecipeEditPage;
