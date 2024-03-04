import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import QuizCard from "../components/card";
import Footer from "../components/footer";
import Header from "../components/header";
import "../styles/home.css";

const Home = () => {
  const [quizzes, setQuizzes] = useState([]);
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
    const isCurrentlyFavorite = favoritesIds.includes(quizId);
    const endpoint = isCurrentlyFavorite
      ? `http://localhost:5000/api/users/favorites/${quizId}`
      : `http://localhost:5000/api/users/favorites/add`;
    const method = isCurrentlyFavorite ? "DELETE" : "POST";

    fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...(method === "POST" && { body: JSON.stringify({ quizId }) }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to toggle favorite");
        }
        return response.json();
      })
      .then(() => {
        if (isCurrentlyFavorite) {
          setFavoritesIds((prevIds) => prevIds.filter((id) => id !== quizId));
        } else {
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
