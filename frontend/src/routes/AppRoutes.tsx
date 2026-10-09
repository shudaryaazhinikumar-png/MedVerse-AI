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
import Progress from "../pages/Progress/Progress";

import Profile from "../pages/Profile/Profile";
import Settings from "../pages/Settings/Settings";
import Help from "../pages/Help/Help";
import Notifications from "../pages/Notifications/Notifications";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            AUTHENTICATION
        ====================================================== */}

        <Route path="/" element={<Splash />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />


        {/* =====================================================
            MAIN APPLICATION
        ====================================================== */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/upload"
          element={<Upload />}
        />

        <Route
          path="/analysis"
          element={<Analysis />}
        />

        <Route
          path="/history"
          element={<History />}
        />

        <Route
          path="/chat"
          element={<Chat />}
        />

        <Route
          path="/prediction"
          element={<Prediction />}
        />

        <Route
          path="/progress"
          element={<Progress />}
        />


        {/* =====================================================
            USER ACCOUNT
        ====================================================== */}

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="/help"
          element={<Help />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;