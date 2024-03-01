import React from "react";
import { Link } from "react-router-dom";
import "../styles/card.css";

const QuizCard = ({ title, backgroundImage, tags, difficulty, to }) => {
  // Générer les étoiles de difficulté
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(i < difficulty ? "★" : "☆");
  }

  return (
    <Link to={to} className="quiz_card_link">
      <div
        className="quiz_card"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="difficulty"> {stars} </div>
        <div className="title">{title}</div>
        <div className="tags"> {tags} </div>
      </div>
    </Link>
  );
};

export default QuizCard;
