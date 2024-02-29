import React from "react";
import "../styles/footer.css"; // Assurez-vous d'avoir créé ce fichier SASS

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© 2024 MonQuiz. Tous droits réservés.</p>
        <div className="social-links">
          {/* Ici, vous pouvez ajouter des liens vers vos réseaux sociaux */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
