import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/images/medverselogo.png";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async () => {
    setMessage("");
    setError("");

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/auth/reset-password",
        {
          token: token,
          new_password: newPassword,
        }
      );

      setMessage(
        response.data?.message ||
        "Password reset successfully"
      );

      setNewPassword("");
      setConfirmPassword("");

      // Go to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error: any) {
      console.error("Reset password error:", error);

      if (error.response) {
        setError(
          error.response.data?.detail ||
          "Unable to reset password"
        );
      } else {
        setError(
          "Cannot connect to MedVerse AI server"
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center"
      >

        <img
          src={logo}
          alt="MedVerse AI Logo"
          className="w-28 h-28 mx-auto object-contain"
        />

        <h1 className="text-3xl font-bold text-blue-700 mt-4">
          Reset Password
        </h1>

        <p className="text-gray-500 mt-2">
          Enter your new password
        </p>

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full mt-6 p-3 border rounded-lg"
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mt-4 p-3 border rounded-lg"
        />

        {error && (
          <p className="text-red-500 text-sm mt-3">
            {error}
          </p>
        )}

        {message && (
          <p className="text-green-600 text-sm mt-3">
            {message}
          </p>
        )}

        <button
          onClick={handleResetPassword}
          disabled={loading}
          className="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p
          className="text-blue-600 text-sm mt-5 cursor-pointer hover:underline"
          onClick={() => navigate("/login")}
        >
          ← Back to Login
        </p>

      </motion.div>

    </div>
  );
}

export default ResetPassword;