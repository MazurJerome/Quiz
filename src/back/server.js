const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Quiz = require("../models/quiz"); // Assurez-vous que le chemin est correct

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json()); // Pour parser les corps de requêtes JSON
app.use(
  cors({
    origin: "http://localhost:3000", // Autorise uniquement les requêtes provenant de cette origine
    methods: ["GET", "POST"], // Autorise seulement ces méthodes
  })
); // Permet les requêtes CORS de toutes origines

mongoose
  .connect(
    "mongodb+srv://jeromeMazur:jlRnYpLj66QDItnn@cluster0.3n7x9q9.mongodb.net/quiz?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((err) => console.log("Connexion à MongoDB échouée !", err));

// Endpoint pour récupérer tous les quiz
app.get("/api/quizzes", async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
    console.log("quizzes récupérés avec succès !");
    console.log("quizzes", quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/quizzes/:id", async (req, res) => {
  const { id } = req.params; // Extraction de l'ID de la requête
  console.log("id trouve", id);
  try {
    const quiz = await Quiz.findById(id); // Chercher le quiz par ID
    if (!quiz) {
      return res.status(404).send("Quiz non trouvé");
    }
    res.json(quiz); // Envoyer le quiz trouvé en réponse
  } catch (error) {
    // Gérer les erreurs (par ex. ID mal formé)
    res.status(500).send("Erreur serveur");
  }
});

// Endpoint pour créer un nouveau quiz
app.post("/api/quizzes", async (req, res) => {
  const quiz = new Quiz(req.body);
  try {
    const savedQuiz = await quiz.save();
    res.status(201).json(savedQuiz);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
