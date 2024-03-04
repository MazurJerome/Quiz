import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import Button from "../components/button";
import Footer from "../components/footer";
import Header from "../components/header";
import "../styles/account.css";

const Account = () => {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState("profile");
  const [favorites, setFavorites] = useState([]);
  const fileInputRef = useRef(null);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);

  const [userInfo, setUserInfo] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    codePostal: "",
    photo: "/uploads/defaultProfile.webp", // URL par défaut
  });

  const fetchCompletedQuizzes = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/users/completed-quizzes", // Assurez-vous que cette route existe et renvoie les données correctes
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok)
        throw new Error(
          "Problème lors de la récupération de l'historique des quiz"
        );
      const quizzes = await response.json();
      setCompletedQuizzes(quizzes);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        navigate("/login");
      } else {
        try {
          const response = await fetch(
            "http://localhost:5000/api/users/profile",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error("Problème lors de la récupération du profil");
          }
          const data = await response.json();
          setUserInfo((prevState) => ({ ...prevState, ...data }));
        } catch (error) {
          console.error(error);
          navigate("/login");
        }
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (token) {
      try {
        const response = await fetch(
          "http://localhost:5000/api/users/profile",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userInfo),
          }
        );
        if (!response.ok) {
          throw new Error("Problème lors de la mise à jour du profil");
        }
        const updatedData = await response.json();
        console.log("Profil mis à jour avec succès", updatedData);
        setUserInfo((prevState) => ({ ...prevState, ...updatedData }));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await fetch(
        "http://localhost:5000/api/users/upload-photo",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Gardez cette ligne
          },
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Problème lors de l'upload de la photo");
      }
      const data = await response.json();
      setUserInfo((prevState) => ({
        ...prevState,
        photo: `http://localhost:5000/uploads/${data.photo}`,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/users/favorites",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok)
        throw new Error("Problème lors de la récupération des favoris");
      const favorites = await response.json();
      // Mettre à jour l'état avec les favoris chargés
      setFavorites(favorites);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    if (selectedMenu === "favorites") {
      fetchFavorites();
    }
    if (selectedMenu === "history") {
      fetchCompletedQuizzes();
    }
  }, [selectedMenu, fetchFavorites, fetchCompletedQuizzes]);

  const removeFavorite = async (quizId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/favorites/${quizId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error("Problème lors de la suppression du favori");
      }
      setFavorites(favorites.filter((favorite) => favorite._id !== quizId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="body">
      <Header />
      <div className="account_container">
        <aside>
          <ul className="account_menu">
            <li onClick={() => setSelectedMenu("profile")}>Profil</li>
            <li onClick={() => setSelectedMenu("favorites")}>Favoris</li>
            <li onClick={() => setSelectedMenu("history")}>
              Historiques des quizzs effectués
            </li>
            <li onClick={handleLogout}>Déconnexion</li>
          </ul>
        </aside>
        <main className="account_content">
          {selectedMenu === "profile" && (
            <div className="profile_content">
              <div className="profile_header">
                <img
                  className="profile_photo"
                  src={userInfo.photo}
                  alt="Profile"
                />
                <div
                  className="change_photo_icon"
                  onClick={handleFileInputClick}
                  title="Changer la photo"
                >
                  {/* Insérez ici votre icône de croix */}
                  &#10005;
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  style={{ display: "none" }}
                />
                <div className="user_info">
                  <h3>
                    {userInfo.prenom} {userInfo.nom}
                  </h3>
                  <p>{userInfo.adresse}</p>
                </div>
              </div>
              <div className="profile_form">
                <input
                  name="prenom"
                  value={userInfo.prenom}
                  onChange={handleProfileChange}
                  placeholder="Prénom"
                />
                <input
                  name="nom"
                  value={userInfo.nom}
                  onChange={handleProfileChange}
                  placeholder="Nom"
                />
                <input
                  name="email"
                  value={userInfo.email}
                  onChange={handleProfileChange}
                  placeholder="Email"
                />
                <input
                  name="telephone"
                  value={userInfo.telephone}
                  onChange={handleProfileChange}
                  placeholder="Téléphone"
                />
                <input
                  name="adresse"
                  value={userInfo.adresse}
                  onChange={handleProfileChange}
                  placeholder="Adresse"
                />
                <input
                  name="codePostal"
                  value={userInfo.codePostal}
                  onChange={handleProfileChange}
                  placeholder="Code Postal"
                />
              </div>
              <Button onClick={handleSaveProfile}>
                Sauvegarder les informations
              </Button>
            </div>
          )}

          {selectedMenu === "favorites" && (
            <div>
              <h2>Favoris:</h2>
              <div className="favorites_container">
                {favorites.length > 0 ? (
                  favorites.map((favorite) => (
                    <div
                      key={favorite._id}
                      className="favorite_card"
                      style={{
                        backgroundImage: `url(${favorite.backgroundImage})`,
                      }}
                      onClick={() => navigate(`/quiz/${favorite._id}`)}
                    >
                      <div className="favorite_content">
                        <h3>{favorite.title}</h3>
                        <button
                          className="remove_favorite_btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(favorite._id);
                          }}
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <h2>Vous n'avez pas encore de favoris</h2>
                )}
              </div>
            </div>
          )}

          {selectedMenu === "history" && (
            <div>
              <h2>Historique des Quizzs:</h2>
              <div className="history_container">
                {completedQuizzes.length > 0 ? (
                  completedQuizzes.map((quiz) => (
                    <div
                      key={quiz._id}
                      className="history_card"
                      style={{
                        backgroundImage: `url(${quiz.backgroundImage})`, // Utilisation de l'image de fond
                      }}
                      onClick={() => navigate(`/quiz/${quiz._id}`)}
                    >
                      <h3>{quiz.title}</h3>
                      <p>Score: {quiz.score} / 10</p>{" "}
                      {/* Affichage du score total */}
                      <p>
                        Date:{" "}
                        {new Date(quiz.completedAt).toLocaleDateString("fr-FR")}
                      </p>
                      <div className="score_feedback">
                        {quiz.score / quiz.totalQuestions === 1 ? (
                          <span className="perfect_score">Parfait!</span>
                        ) : quiz.score / quiz.totalQuestions >= 0.8 ? (
                          <span className="high_score">Excellent!</span>
                        ) : quiz.score / quiz.totalQuestions >= 0.6 ? (
                          <span className="medium_score">Bien joué!</span>
                        ) : quiz.score / quiz.totalQuestions >= 0.4 ? (
                          <span className="low_score">Pas mal</span>
                        ) : (
                          <span className="needs_improvement">
                            Vous ferez mieux la prochaine fois
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <h2>Aucun quizz effectué pour l'instant</h2>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
