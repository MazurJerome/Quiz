import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../components/footer";
import Header from "../components/header";
import "../styles/quiz.css";

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    fetch(`http://localhost:5000/api/quizzes/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur réseau");
        }
        return response.json();
      })
      .then((data) => setQuiz(data))
      .catch((error) =>
        console.error("Erreur lors de la récupération du quiz:", error)
      );
  }, [id]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex,
    });
  };

  let allQuestionsAnswered =
    quiz &&
    quiz.questions.every((_, index) => selectedAnswers.hasOwnProperty(index));

  const calculateScore = () => {
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (
        question.answers[selectedAnswers[index]] &&
        question.answers[selectedAnswers[index]].correct
      ) {
        score += 1;
      }
    });
    return score;
  };

  const showResults = () => {
    const score = calculateScore();
    navigate(`/result`, {
      state: { score: score, total: quiz.questions.length },
    });
  };

  if (!quiz) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="body">
      <Header />
      <div className="body_quiz">
        <h2>{quiz.title}</h2>
        <div>
          <h3>{`Question ${currentQuestionIndex + 1}: ${
            quiz.questions[currentQuestionIndex].questionText
          }`}</h3>
          <ul>
            {quiz.questions[currentQuestionIndex].answers.map(
              (answer, answerIndex) => (
                <li
                  key={answerIndex}
                  className={`answer_card ${
                    selectedAnswers[currentQuestionIndex] === answerIndex
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleAnswerSelect(currentQuestionIndex, answerIndex)
                  }
                >
                  {answer.text}
                </li>
              )
            )}
          </ul>
        </div>
        {currentQuestionIndex < quiz.questions.length - 1 &&
          selectedAnswers[currentQuestionIndex] !== undefined && (
            <button onClick={handleNextQuestion}>Suivant</button>
          )}
        {allQuestionsAnswered && (
          <button onClick={showResults}>Voir les résultats</button>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Quiz;
