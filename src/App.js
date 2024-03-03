import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext.jsx";
import Account from "./pages/account";
import Home from "./pages/home";
import Login from "./pages/login";
import Quiz from "./pages/quiz";
import Result from "./pages/result";
import "./styles/app.css";
import "./styles/normalize.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        {" "}
        {/* Englober avec AuthProvider */}
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz/:id" element={<Quiz />} />
            <Route path="/result" element={<Result />} />
            <Route path="/login" element={<Login />} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
