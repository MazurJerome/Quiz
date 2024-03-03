import React from "react";
import { Link } from "react-router-dom";
import "../styles/header.css";

const Header = () => {
  return (
    <header>
      <div className="logo">
        <Link to="/">MonQuiz</Link>
      </div>
      <nav className="navigation">
        <ul>
          <li>
            <Link to="/">Accueil</Link>
          </li>
          <li>
            <Link to="/account">compte</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
