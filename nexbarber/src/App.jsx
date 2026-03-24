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
            <ProtectedRoute allow={["dono", "funcionario"]} feature="painel">
              <PainelLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <ProtectedRoute allow={["dono", "funcionario"]} feature="painel">
                <PainelHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="agenda"
            element={
              <ProtectedRoute allow={["dono", "funcionario"]} feature="agenda">
                <PainelAgenda />
              </ProtectedRoute>
            }
          />
          <Route
            path="clientes"
            element={
              <ProtectedRoute allow={["dono", "funcionario"]} feature="clientes">
                <PainelClientes />
              </ProtectedRoute>
            }
          />
          <Route
            path="barbeiros"
            element={
              <ProtectedRoute allow={["dono", "funcionario"]} feature="barbeiros">
                <PainelBarbeiros />
              </ProtectedRoute>
            }
          />
          <Route
            path="servicos"
            element={
              <ProtectedRoute allow={["dono", "funcionario"]} feature="servicos">
                <PainelServicos />
              </ProtectedRoute>
            }
          />
          <Route
            path="produtos"
            element={
              <ProtectedRoute allow={["dono", "funcionario"]} feature="produtos">
                <PainelProdutos />
              </ProtectedRoute>
            }
          />
          <Route
            path="relatorios"
            element={
              <ProtectedRoute allow={["dono", "funcionario"]} feature="relatorios">
                <PainelRelatorios />
              </ProtectedRoute>
            }
          />
          <Route
            path="assinaturas"
            element={
              <ProtectedRoute allow={["dono", "funcionario"]} feature="assinaturas">
                <PainelAssinaturas />
              </ProtectedRoute>
            }
          />
          <Route
            path="pdv"
            element={
              <ProtectedRoute allow={["dono", "funcionario"]} feature="pdv">
                <PainelPdv />
              </ProtectedRoute>
            }
          />
          <Route
            path="personalizar"
            element={
              <ProtectedRoute allow={["dono", "funcionario"]} feature="personalizar">
                <PainelPersonalizar />
              </ProtectedRoute>
            }
          />
          <Route
            path="configuracoes"
            element={
              <ProtectedRoute allow={["dono", "funcionario"]} feature="configuracoes">
                <PainelConfiguracoes />
              </ProtectedRoute>
            }
          />
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
