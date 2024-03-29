const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nom: String,
  prenom: String,
  adresse: String,
  telephone: String,
  codePostal: String,
  photo: String, // Ajout d'un champ pour l'URL de la photo de profil
  createdAt: { type: Date, default: Date.now },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },
  ],
  completedQuizzes: [
    {
      quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
      score: Number,
      completedAt: Date,
    },
  ],
});

const User = mongoose.model("user", userSchema);

module.exports = User;
