import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Footer from "../components/footer";
import Header from "../components/header";
import "../styles/resultat.css";

function ResultPage() {
  const location = useLocation();
  const { score, total } = location.state || { score: 0, total: 0 };
  const h2Ref = useRef(null);

  useEffect(() => {
    if (h2Ref.current) {
      h2Ref.current.focus();
    }
  }, []);

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
