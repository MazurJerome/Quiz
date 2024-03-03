import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import Button from "../components/button";
import Footer from "../components/footer";
import Header from "../components/header";
import "../styles/login.css";

const Login = () => {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/account");
    }
  }, [isLoggedIn, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const registerData = {
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
      };
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Échec de l'inscription");
      }

      console.log("Inscription réussie");
      setIsRegistering(false);
      setErrorMessage(""); // Réinitialiser les messages d'erreur
    } catch (error) {
      console.error("Erreur lors de l'inscription", error);
      setErrorMessage(error.message);
    }
  };

  // Gérer la connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const loginData = {
        email: loginEmail,
        password: loginPassword,
      };
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        throw new Error("Échec de la connexion");
      }

      const data = await response.json();
      if (data.token) {
        login(data.token);
        console.log("Connexion réussie", data.token);
        navigate("/account");
      } else {
        throw new Error("Aucun token reçu");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion", error);
    }
  };

  return (
    <div className="body">
      <Header />
      <div className="body_login">
        <div className="form-container">
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="toggle">
            <Button onClick={() => setIsRegistering(false)}>Connexion</Button>
            <Button onClick={() => setIsRegistering(true)}>Inscription</Button>
          </div>

          {!isRegistering ? (
            <div className="login-form">
              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <Button type="submit">Connexion</Button>
              </form>
            </div>
          ) : (
            <div className="register-form">
              <form onSubmit={handleRegister}>
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
                <Button type="submit">Inscription</Button>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
