import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import Footer from "../components/footer";
import Header from "../components/header";
import "../styles/account.css";

const Account = () => {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState("profile");

  const [userInfo, setUserInfo] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    codePostal: "",
    photo:
      "https://www.shutterstock.com/image-vector/default-profile-picture-avatar-photo-600nw-1725917284.jpg", // URL par défaut
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="account_page">
      <Header />
      <div className="account_container">
        <aside>
          <ul className="account_menu">
            <li onClick={() => setSelectedMenu("profile")}>Profil</li>
            <li onClick={() => setSelectedMenu("favorites")}>Favoris</li>
            <li onClick={() => setSelectedMenu("history")}>
              Historiques des quizzs effectués
            </li>
            <li onClick={() => setSelectedMenu("notifications")}>
              Notifications
            </li>
            <li onClick={handleLogout}>Déconnexion</li>
          </ul>
        </aside>
        <main className="account_content">
          {selectedMenu === "profile" && (
            <div className="profile_content">
              <div className="profile_header">
                <input type="file" onChange={handlePhotoUpload} />
                {userInfo.photo && (
                  <img
                    className="profile_photo"
                    src={`http://localhost:5000${userInfo.photo}`} // Assurez-vous que cela correspond au chemin retourné par l'API
                    alt="Profile"
                  />
                )}
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
              <button onClick={handleSaveProfile}>
                Sauvegarder les informations
              </button>
            </div>
          )}

          {selectedMenu === "favorites" && <div>Contenu des Favoris</div>}
          {selectedMenu === "history" && <div>Historique des Quizzs</div>}
          {selectedMenu === "notifications" && <div>Notifications</div>}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
