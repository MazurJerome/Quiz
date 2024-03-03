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
    methods: ["GET", "POST", "PATCH"],
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
