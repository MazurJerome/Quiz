const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: String,
  difficulty: Number,
  tags: [String],
  questions: [
    {
      questionText: String,
      answers: [
        {
          text: String,
          correct: Boolean,
        },
      ],
    },
  ],
  backgroundImage: { type: String, required: true },
});

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;
