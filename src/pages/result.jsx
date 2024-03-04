import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import Footer from "../components/footer";
import Header from "../components/header";
import "../styles/resultat.css";

function ResultPage() {
  const location = useLocation();
  const { score, total, quizId } = location.state || { score: 0, total: 0 };
  const h2Ref = useRef(null);
  const { token } = useAuth();
  const [quizzCompleted, setQuizzCompleted] = useState(false);

  useEffect(() => {
    if (h2Ref.current) {
      h2Ref.current.focus();
    }
  }, [quizId, score, token]);

  const completeQuiz = useCallback(
    async (quizId, score) => {
      const response = await fetch(
        "http://localhost:5000/api/users/complete-quiz",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quizId, score }),
        }
      );
      if (!response.ok) {
        console.error("Erreur lors de l'enregistrement du quiz terminé");
      }
    },
    [token]
  );

  useEffect(() => {
    if (quizId && token && !quizzCompleted) {
      completeQuiz(quizId, score);
      setQuizzCompleted(true);
    }
  }, [quizId, score, token, quizzCompleted, completeQuiz]);

  return (
    <div className="body">
      <Header />
      <div className="body_result">
        <h2 tabIndex="-1" ref={h2Ref}>
          Résultats du Quiz
        </h2>
        <p className="result_score">
          Votre score est de {score} sur {total}.
        </p>
        <Link to="/" className="home_button">
          Retour à l'accueil
        </Link>
      </div>
      <Footer />
    </div>
  );
}

export default ResultPage;
