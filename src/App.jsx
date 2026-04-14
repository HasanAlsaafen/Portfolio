import "./index.css";
import Dashboard from "./pages/Dashboard";
import Main from "./pages/Main";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProjectDetails from "./pages/ProjectDetails";
import Maintenance from "./pages/Maintenance";
import { Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./Routes/ProtectedRoutes";
import { useState, createContext } from "react";
import { LanguageProvider } from "./context/LanguageContext";
export const AccessTokenContext = createContext({
  accessToken: "",
  handleSetAccessToken: (token) => {}
});

export default function App() {
  const [accessToken, setAccessToken] = useState("");
  const handleSetAccessToken = (token) => {
    console.log(token);
    setAccessToken(token);
  }
  return (
    <LanguageProvider>
    <AccessTokenContext.Provider value={{accessToken, handleSetAccessToken}}>
    <Routes>
      <Route path="/" element={<Maintenance />} />
      <Route path="*" element={<Maintenance />} />
      {/* 
      <Route path="/" element={<Main />} />
      <Route path="/project/:id" element={<ProjectDetails />} />
      <Route path="/login" element={<Login  />} />
      <Route path="/dashboard" element={<ProtectedRoutes  />}>
        <Route index element={<Dashboard />} />
      </Route>
      <Route path="*" element={<NotFound />} /> 
      */}
    </Routes>
    </AccessTokenContext.Provider>
    </LanguageProvider>
  );
}
