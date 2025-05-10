import { Link } from 'react-router-dom';

type Props = {
  recipe: {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
  };
};

const RecipeCard = ({ recipe }: Props) => {
  return (
    <div>
      <img src={recipe.image_url} alt={recipe.name} />
      <h3>{recipe.name}</h3>
      <p>{recipe.description}</p>
      <Link to={`/rezepte/${recipe.id}`}>Zum Rezept</Link>
    </div>
  );
};

export default RecipeCard;
