import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ModeloBarbearia from "./pages/Barbearia/ModeloBarbearia";
import PainelLayout from "./pages/painel/PainelLayout";
import PainelHome from "./pages/painel/PainelHome";
import PainelAgenda from "./pages/painel/PainelAgenda";
import PainelClientes from "./pages/painel/PainelClientes";
import PainelBarbeiros from "./pages/painel/PainelBarbeiros";
import PainelServicos from "./pages/painel/PainelServicos";
import PainelProdutos from "./pages/painel/PainelProdutos";
import PainelRelatorios from "./pages/painel/PainelRelatorios";
import PainelConfiguracoes from "./pages/painel/PainelConfiguracoes";
import PainelPersonalizar from "./pages/painel/PainelPersonalizar";
import PainelAssinaturas from "./pages/painel/PainelAssinaturas";
import PainelPdv from "./pages/painel/PainelPdv";
import ProtectedRoute from "./components/ProtectedRoute";
import MasterLayout from "./pages/master/MasterLayout";
import MasterHome from "./pages/master/MasterHome";
import MasterBarbearias from "./pages/master/MasterBarbearias";
import MasterPagamentos from "./pages/master/MasterPagamentos";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/barbearia/:id" element={<ModeloBarbearia />} />
        <Route
          path="/painel"
          element={
            <ProtectedRoute allow={["dono", "funcionario"]}>
              <PainelLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PainelHome />} />
          <Route path="agenda" element={<PainelAgenda />} />
          <Route path="clientes" element={<PainelClientes />} />
          <Route path="barbeiros" element={<PainelBarbeiros />} />
          <Route path="servicos" element={<PainelServicos />} />
          <Route path="produtos" element={<PainelProdutos />} />
          <Route path="relatorios" element={<PainelRelatorios />} />
          <Route path="assinaturas" element={<PainelAssinaturas />} />
          <Route path="pdv" element={<PainelPdv />} />
          <Route path="personalizar" element={<PainelPersonalizar />} />
          <Route path="configuracoes" element={<PainelConfiguracoes />} />
        </Route>
        <Route
          path="/master"
          element={
            <ProtectedRoute allow={["master"]}>
              <MasterLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MasterHome />} />
          <Route path="barbearias" element={<MasterBarbearias />} />
          <Route path="pagamentos" element={<MasterPagamentos />} />
          <Route path="relatorios" element={<Navigate to="/master" replace />} />
          <Route path="configuracoes" element={<Navigate to="/master" replace />} />
        </Route>
        <Route path="/dashboard" element={<Navigate to="/painel" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
