import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/footer";
import Header from "../components/header";

const Result = () => {
  // Ici, vous afficherez les résultats du quiz
  return (
    <div>
      <Header />
      <h1>Résultats du Quiz</h1>
      {/* Afficher les résultats ici */}
      <Link to="/">Retour à l'accueil</Link>
      <Footer />
    </div>
  );
};

export default Result;
