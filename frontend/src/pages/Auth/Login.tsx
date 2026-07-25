import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/medverselogo.png";

function Login() {

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <motion.div
        initial={{opacity:0, y:30}}
        animate={{opacity:1, y:0}}
        transition={{duration:0.6}}
        className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center"
      >

        <img
          src={logo}
          alt="MedVerse AI Logo"
          className="w-28 h-28 mx-auto object-contain"
        />


        <h1 className="text-3xl font-bold text-blue-700 mt-4">
          MedVerse AI
        </h1>


        <p className="text-gray-500 mt-2">
          Intelligent Medical Report Analyzer
        </p>


        <input
          type="email"
          placeholder="Email"
          className="w-full mt-6 p-3 border rounded-lg"
        />


        <input
          type="password"
          placeholder="Password"
          className="w-full mt-4 p-3 border rounded-lg"
        />


        <button
          onClick={() => navigate("/dashboard")}
          className="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>


        <p className="mt-5 text-sm text-gray-500">
          Don't have an account?
          <span className="text-blue-600 ml-1 cursor-pointer">
            Register
          </span>
        </p>


      </motion.div>

    </div>
  );
}


export default Login;