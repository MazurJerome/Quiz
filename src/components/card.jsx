import React from "react";
import { Link } from "react-router-dom";
import "../styles/card.css";

const QuizCard = ({
  id,
  title,
  backgroundImage,
  tags,
  difficulty,
  to,
  onFavoriteToggle,
  isFavorite,
}) => {
  const stars = Array.from({ length: 5 }, (_, i) =>
    i < difficulty ? "★" : "☆"
  );

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Empêche l'événement de remonter aux éléments parents
    onFavoriteToggle(id);
  };

  return (
    <div
      className="quiz_card"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="quiz_card_favorite" onClick={handleFavoriteClick}>
        {isFavorite ? (
          <span className="favorite_star filled">★</span>
        ) : (
          <span className="favorite_star">☆</span>
        )}
      </div>
      <Link to={to} className="quiz_card_content">
        <div className="difficulty">{stars.join("")}</div>
        <div className="title">{title}</div>
        <div className="tags">{tags.join(", ")}</div>
      </Link>
    </div>
  );
};

export default QuizCard;
