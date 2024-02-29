import React, { useEffect, useState } from "react";
import QuizCard from "../components/card";
import Footer from "../components/footer";
import Header from "../components/header";
import "../styles/home.css";

const Home = () => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/quizzes")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => setQuizzes(data))
      .catch((error) =>
        console.error(
          "There has been a problem with your fetch operation:",
          error
        )
      );
  }, []); // Le tableau vide assure que l'effet ne s'exécute qu'une fois après le premier rendu

  return (
    <div className="body">
      <Header />
      <h1>Bienvenue sur le Quiz</h1>
      <div className="home_page">
        {quizzes.map((quiz, index) => (
          <QuizCard
            key={index}
            title={quiz.title}
            backgroundImage={quiz.backgroundImage}
            tags={quiz.tags}
            difficulty={quiz.difficulty}
            to={`/quiz/${quiz._id}`}
          />
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default Home;
