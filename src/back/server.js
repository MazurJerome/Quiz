const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const Quiz = require("../models/quiz");
const bcrypt = require("bcrypt");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const multer = require("multer");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware pour analyser les requêtes JSON
app.use(express.json());

// Configuration CORS pour permettre les requêtes cross-origin
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

// Servir des fichiers statiques (images) depuis le dossier public
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../../public/uploads"))
);

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((err) => console.log("Connexion à MongoDB échouée !", err));

// Middleware pour authentifier le token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Configuration de multer pour le téléchargement des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../../public/uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Routes pour les quizzes
app.get("/api/quizzes", async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/quizzes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).send("Quiz non trouvé");
    res.json(quiz);
  } catch (error) {
    res.status(500).send("Erreur serveur");
  }
});

app.post("/api/users/favorites/add", authenticateToken, async (req, res) => {
  const { quizId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send({ message: "User not found" });

    if (!user.favorites.includes(quizId)) {
      user.favorites.push(quizId);
      await user.save();
      res.status(200).send({ message: "Quiz ajouté aux favoris" });
    } else {
      res.status(400).send({ message: "Quiz déjà dans les favoris" });
    }
  } catch (error) {
    res.status(500).send({ message: "Erreur lors de l'ajout aux favoris" });
  }
});

app.delete(
  "/api/users/favorites/:quizId",
  authenticateToken,
  async (req, res) => {
    const { quizId } = req.params;
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).send({ message: "User not found" });

      user.favorites = user.favorites.filter(
        (favorite) => favorite.toString() !== quizId
      );
      await user.save();
      res.status(200).send({ message: "Quiz supprimé des favoris" });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Erreur lors de la suppression des favoris" });
    }
  }
);

app.get("/api/users/favorites", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");
    if (!user) return res.status(404).send({ message: "User not found" });

    res.json(user.favorites);
  } catch (error) {
    res.status(500).send({ message: "Error fetching favorites" });
  }
});

// Routes pour les utilisateurs
app.post("/api/users/register", async (req, res) => {
  const { username, email, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    res.status(500).send({ message: "Error creating the user" });
  }
});

app.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).send({ message: "Email or password is wrong" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).send({ message: "Invalid email or password." });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.send({ token });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

// Route pour obtenir l'historique des quiz complétés par l'utilisateur
app.get("/api/users/completed-quizzes", authenticateToken, async (req, res) => {
  try {
    // Utilisez req.user._id pour identifier l'utilisateur authentifié
    const user = await User.findById(req.user._id).populate({
      path: "completedQuizzes.quizId",
      select: "title backgroundImage",
    });

    if (!user) {
      return res.status(404).send({ message: "Utilisateur non trouvé" });
    }

    // Préparez les données à renvoyer
    const completedQuizzes = user.completedQuizzes.map((quiz) => ({
      _id: quiz.quizId._id,
      title: quiz.quizId.title,
      backgroundImage: quiz.quizId.backgroundImage, // Ajoutez l'URL de l'image de fond
      score: quiz.score,
      completedAt: quiz.completedAt,
    }));

    res.json(completedQuizzes);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'historique des quiz:",
      error
    );
    res.status(500).send({
      message:
        "Erreur serveur lors de la récupération de l'historique des quiz",
    });
  }
});

app.post("/api/users/complete-quiz", authenticateToken, async (req, res) => {
  const { quizId, score } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    // Logique pour ajouter ou mettre à jour le quiz complété
    let existingQuizIndex = user.completedQuizzes.findIndex(
      (quiz) => quiz.quizId.toString() === quizId
    );

    if (existingQuizIndex !== -1) {
      // Mettre à jour le score si supérieur
      if (user.completedQuizzes[existingQuizIndex].score < score) {
        user.completedQuizzes[existingQuizIndex].score = score;
        user.completedQuizzes[existingQuizIndex].completedAt = new Date();
      }
    } else {
      // Ajouter un nouveau quiz complété
      user.completedQuizzes.push({ quizId, score, completedAt: new Date() });
    }

    // Fusionne les résultats identiques
    user.completedQuizzes = user.completedQuizzes.reduce((acc, current) => {
      const x = acc.find(
        (item) => item.quizId.toString() === current.quizId.toString()
      );
      if (!x) {
        return acc.concat([current]);
      } else if (x.score < current.score) {
        x.score = current.score;
        x.completedAt = current.completedAt;
      }
      return acc;
    }, []);
    // Tentative de sauvegarde
    try {
      await user.save();
      res.status(200).send("Quiz enregistré avec succès.");
    } catch (error) {
      if (error.name === "VersionError") {
        // Réessayer la sauvegarde si erreur de version
        try {
          await user.save();
          res.status(200).send("Quiz enregistré avec succès après réessai.");
        } catch (secondError) {
          console.error(
            "Erreur lors du réessai d'enregistrement du quiz:",
            secondError
          );
          res
            .status(500)
            .send("Erreur lors de l'enregistrement du quiz après réessai.");
        }
      } else {
        console.error(
          "Erreur lors de l'enregistrement du quiz terminé:",
          error
        );
        res.status(500).send("Erreur lors de l'enregistrement du quiz.");
      }
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(500).send("Erreur serveur.");
  }
});

app.post(
  "/api/users/upload-photo",
  authenticateToken,
  upload.single("photo"),
  async (req, res) => {
    const userId = req.user._id;
    const photoUrl = `/uploads/${req.file.filename}`;

    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { photo: photoUrl },
        { new: true }
      );
      res.json({ photo: updatedUser.photo });
    } catch (error) {
      res.status(500).send({ message: "Error updating user's photo" });
    }
  }
);

app.get("/api/users/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).send({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).send({ message: "Error fetching user profile" });
  }
});

app.patch("/api/users/profile", authenticateToken, async (req, res) => {
  const userId = req.user._id;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: req.body },
      { new: true }
    ).select("-password");
    if (!updatedUser)
      return res.status(404).send({ message: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).send({ message: "Error updating user profile" });
  }
});

app.listen(port, () => console.log(`Serveur démarré sur le port ${port}`));
