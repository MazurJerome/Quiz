import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "./pages/home";
import Quiz from "./pages/quiz";
import Result from "./pages/result";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz/:id" element={<Quiz />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
