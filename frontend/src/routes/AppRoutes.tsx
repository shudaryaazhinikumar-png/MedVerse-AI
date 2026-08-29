import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard/Dashboard";
import Splash from "../pages/Splash/Splash";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import Upload from "../pages/Upload/Upload";
import Analysis from "../pages/Analysis/Analysis";
import History from "../pages/History/History";
import Chat from "../pages/Chat/Chat";
import Prediction from "../pages/Prediction/Prediction";


function AppRoutes() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Splash />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/upload" element={<Upload />} />

        <Route path="/analysis" element={<Analysis />} />

        <Route path="/history" element={<History />} />

        <Route path="/chat" element={<Chat />} />

        <Route path="/prediction" element={<Prediction />} />

      </Routes>

    </BrowserRouter>

  );
}


export default AppRoutes;