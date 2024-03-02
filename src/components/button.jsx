import React from "react";
import "../styles/button.css";

const Button = ({ onClick, children, ariaLabel, className }) => {
  return (
    <button
      className={`button ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default Button;
