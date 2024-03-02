import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/button"; // Ajustez le chemin selon votre structure
import Footer from "../components/footer";
import Header from "../components/header";
import "../styles/quiz.css"; // Ou le chemin vers votre fichier CSS généré à partir de SCSS

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [explanation, setExplanation] = useState("");
  const questionRef = useRef(null);

  const fetchQuiz = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${id}`);
      if (!response.ok) {
        throw new Error("Erreur réseau");
      }
      const data = await response.json();
      setQuiz(data);
    } catch (error) {
      console.error("Erreur lors de la récupération du quiz:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  useEffect(() => {
    if (questionRef.current) {
      questionRef.current.focus();
    }
  }, [currentQuestionIndex]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setIsAnswerSubmitted(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: answerIndex });
    setIsAnswerSubmitted(false);
  };

  const handleAnswerSubmit = () => {
    setIsAnswerSubmitted(true);
    const correctAnswerIndex = quiz.questions[
      currentQuestionIndex
    ].answers.findIndex((answer) => answer.correct);
    const isCorrect =
      selectedAnswers[currentQuestionIndex] === correctAnswerIndex;
    const correctAnswer =
      quiz.questions[currentQuestionIndex].answers[correctAnswerIndex];
    setExplanation(
      isCorrect
        ? `En effet! C'est la bonne réponse. ${correctAnswer.explanation || ""}`
        : `La bonne réponse est : ${correctAnswer.text}. ${
            correctAnswer.explanation || ""
          }`
    );
  };

  const calculateScore = () =>
    quiz.questions.reduce(
      (score, question, index) =>
        score + (question.answers[selectedAnswers[index]]?.correct ? 1 : 0),
      0
    );

  const showResults = () =>
    navigate("/result", {
      state: { score: calculateScore(), total: quiz.questions.length },
    });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="body">
      <Header />
      <div className="body_quiz">
        <h2>{quiz?.title}</h2>
        <div>
          <h3 tabIndex="-1" ref={questionRef}>
            Question {currentQuestionIndex + 1}:{" "}
            {quiz?.questions[currentQuestionIndex]?.questionText}
          </h3>
          <ul>
            {quiz?.questions[currentQuestionIndex]?.answers.map(
              (answer, answerIndex) => (
                <li
                  tabIndex="0"
                  key={answerIndex}
                  className={`answer_card ${
                    selectedAnswers[currentQuestionIndex] === answerIndex
                      ? isAnswerSubmitted
                        ? answer.correct
                          ? "correct"
                          : "incorrect"
                        : "selected"
                      : ""
                  }`}
                  onClick={() =>
                    !isAnswerSubmitted &&
                    handleAnswerSelect(currentQuestionIndex, answerIndex)
                  }
                  onKeyPress={(event) =>
                    event.key === "Enter" &&
                    !isAnswerSubmitted &&
                    handleAnswerSelect(currentQuestionIndex, answerIndex)
                  }
                >
                  {answer.text}
                </li>
              )
            )}
          </ul>
          <div
            className={`explanation_container ${
              isAnswerSubmitted ? "explanation_visible" : ""
            }`}
          >
            {isAnswerSubmitted && <div>{explanation}</div>}
          </div>
          <div className="button_container">
            {selectedAnswers[currentQuestionIndex] !== undefined &&
              !isAnswerSubmitted && (
                <Button
                  onClick={handleAnswerSubmit}
                  ariaLabel="Vérifier la réponse sélectionnée"
                  className="verify"
                >
                  Vérifier
                </Button>
              )}
            {isAnswerSubmitted &&
              (currentQuestionIndex < quiz.questions.length - 1 ? (
                <Button onClick={handleNextQuestion} className="next">
                  Suivant
                </Button>
              ) : (
                <Button onClick={showResults} className="results">
                  Voir les résultats
                </Button>
              ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Quiz;
