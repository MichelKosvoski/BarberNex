import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ModeloBarbearia from "./pages/Barbearia/ModeloBarbearia";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/barbearia/:id" element={<ModeloBarbearia />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
