import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import QuizCard from "../components/card";
import Footer from "../components/footer";
import Header from "../components/header";
import "../styles/home.css";

const Home = () => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();
  const [favoritesIds, setFavoritesIds] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetch("http://localhost:5000/api/quizzes")
      .then((response) => response.json())
      .then((data) => setQuizzes(data))
      .catch((error) => console.error("Error fetching quizzes:", error));
  }, []);

  useEffect(() => {
    if (token) {
      fetch("http://localhost:5000/api/users/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((favorites) => {
          const ids = favorites.map((fav) => fav._id);
          setFavoritesIds(ids);
        })
        .catch((error) => console.error("Error fetching favorites:", error));
    }
  }, [token]);

  const toggleFavorite = (quizId) => {
    // Vérifier si le quiz est actuellement un favori
    const isCurrentlyFavorite = favoritesIds.includes(quizId);
    // Déterminer l'endpoint et la méthode HTTP en fonction de si on ajoute ou supprime un favori
    const endpoint = isCurrentlyFavorite
      ? `http://localhost:5000/api/users/favorites/${quizId}` // Endpoint pour supprimer des favoris
      : `http://localhost:5000/api/users/favorites/add`; // Endpoint pour ajouter aux favoris
    const method = isCurrentlyFavorite ? "DELETE" : "POST";

    fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Assurez-vous d'inclure le token JWT
      },
      // Inclure le corps de la requête uniquement pour l'ajout d'un favori
      ...(method === "POST" && { body: JSON.stringify({ quizId }) }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to toggle favorite");
        }
        return response.json();
      })
      .then(() => {
        // Mettre à jour l'état des identifiants des favoris
        if (isCurrentlyFavorite) {
          // Si le quiz était un favori, le retirer de l'état
          setFavoritesIds((prevIds) => prevIds.filter((id) => id !== quizId));
        } else {
          // Si le quiz n'était pas un favori, l'ajouter à l'état
          setFavoritesIds((prevIds) => [...prevIds, quizId]);
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className="body">
      <Header />
      <h1>Bienvenue sur le Quiz</h1>
      <div className="home_page">
        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz._id}
            id={quiz._id}
            title={quiz.title}
            backgroundImage={quiz.backgroundImage}
            tags={quiz.tags}
            difficulty={quiz.difficulty}
            to={`/quiz/${quiz._id}`}
            onFavoriteToggle={toggleFavorite}
            isFavorite={favoritesIds.includes(quiz._id)}
          />
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default Home;
