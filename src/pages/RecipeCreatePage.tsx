import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseClient } from '../lib/supabaseClient';
import { useUser } from '../contexts/UserContext';
import styles from './RecipeCreatePage.module.css';

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

const uploadRecipeImage = async (
  file: File,
  userId: string
): Promise<string> => {
  const filePath = `recipes/${userId}-${Date.now()}-${file.name}`;

  const { error } = await supabaseClient.storage
    .from('recipe-images')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    console.error('Upload-Fehler:', error);
    throw new Error(error.message || 'Unbekannter Upload-Fehler');
  }

  const { data } = supabaseClient.storage
    .from('recipe-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

const RecipeCreatePage = () => {
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    supabaseClient
      .from('categories')
      .select('*')
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string | number
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
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
    if (!user?.id) return alert('Benutzer nicht eingeloggt.');

    let finalImageUrl = imageUrl;

    if (imageFile) {
      try {
        finalImageUrl = await uploadRecipeImage(imageFile, user.id);
        setImageUrl(finalImageUrl);
      } catch (err) {
        alert('Bild-Upload fehlgeschlagen: ' + err);
        return;
      }
    }

    const { data: recipe, error } = await supabaseClient
      .from('recipes')
      .insert([
        {
          name,
          description,
          servings,
          instructions,
          category_id: categoryId,
          user_id: user.id,
          image_url: finalImageUrl || null,
        },
      ])
      .select()
      .single();

    if (error || !recipe) return alert('Fehler beim Speichern.');

    const formattedIngredients = ingredients.map((ing) => ({
      ...ing,
      recipe_id: recipe.id,
    }));

    await supabaseClient.from('ingredients').insert(formattedIngredients);
    navigate(`/rezepte/${recipe.id}`);
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.heading}>Rezept erstellen</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className={styles.input}
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Beschreibung"
          className={styles.textarea}
        />

        <input
          type="number"
          value={servings}
          onChange={(e) => setServings(Number(e.target.value) || 1)}
          min={1}
          className={styles.input}
        />

        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Anleitung"
          className={styles.textarea}
        />

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className={styles.select}
        >
          <option value="">Kategorie wählen</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <label htmlFor="image" className={styles.fileLabel}>
          📷 Bild hinzufügen
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
              setImageUrl(URL.createObjectURL(file)); // lokale Vorschau
            }
          }}
        />

        {imageUrl && (
          <img src={imageUrl} alt="Vorschau" className={styles.imagePreview} />
        )}

        <h4>Zutaten</h4>
        {ingredients.map((ing, index) => (
          <div key={index} className={styles.ingredientBox}>
            <div className={styles.ingredientGrid}>
              <input
                type="text"
                placeholder="Name"
                value={ing.name}
                onChange={(e) =>
                  handleIngredientChange(index, 'name', e.target.value)
                }
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Menge"
                value={ing.quantity ?? ''}
                onChange={(e) =>
                  handleIngredientChange(
                    index,
                    'quantity',
                    parseFloat(e.target.value) || 0
                  )
                }
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Einheit"
                value={ing.unit}
                onChange={(e) =>
                  handleIngredientChange(index, 'unit', e.target.value)
                }
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Zusatzinfo"
                value={ing.additional_info || ''}
                onChange={(e) =>
                  handleIngredientChange(
                    index,
                    'additional_info',
                    e.target.value
                  )
                }
                className={styles.input}
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className={styles.removeButton}
              >
                Entfernen
              </button>
            </div>
          </div>
        ))}

        <button type="button" onClick={addIngredient} className={styles.button}>
          ➕ Zutat hinzufügen
        </button>

        <button type="submit" className={styles.submitButton}>
          🍽️ Rezept hochladen
        </button>
      </form>
    </section>
  );
};

export default RecipeCreatePage;
