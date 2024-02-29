import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../components/footer";
import Header from "../components/header";
import "../styles/quiz.css";

const Quiz = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/quizzes/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur réseau");
        }
        return response.json(); // Parse la réponse en JSON
      })
      .then((data) => setQuiz(data)) // Met à jour l'état avec les détails du quiz
      .catch((error) =>
        console.error("Erreur lors de la récupération du quiz:", error)
      );
  }, [id]); // L'effet se déclenche à nouveau si l'ID change

  if (!quiz) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="body">
      <Header />
      <div className="body_quiz">
        <h2>{quiz.title}</h2>
        <div>
          {quiz.questions.map((question, index) => (
            <div key={index}>
              <h3>{`Question ${index + 1}: ${question.questionText}`}</h3>
              <ul>
                {question.answers.map((answer, answerIndex) => (
                  <li key={answerIndex}>{answer.text}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Link to="/result">Voir les résultats</Link>
      </div>
      <Footer />
    </div>
  );
};

export default Quiz;
