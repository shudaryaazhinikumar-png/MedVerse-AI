import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/medverselogo.png";

function Splash() {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/login")}
      className="flex min-h-screen items-center justify-center bg-white cursor-pointer"
    >
      <div className="text-center">

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="mx-auto mb-6 flex h-40 w-40 items-center justify-center rounded-full border-4 border-blue-600 shadow-lg overflow-hidden bg-white"
        >
          <img
            src={logo}
            alt="MedVerse AI Logo"
            className="h-full w-full object-contain p-3"
          />
        </motion.div>


        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.5,
          }}
          className="text-4xl font-bold text-blue-700"
        >
          MedVerse AI
        </motion.h1>


        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.8,
          }}
          className="mt-3 text-gray-500"
        >
          Intelligent Medical Report Analyzer
        </motion.p>


        <motion.div
          animate={{
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="mt-8 text-sm text-blue-500"
        >
          Powered by AI Healthcare Intelligence
        </motion.div>


        <p className="mt-6 text-xs text-gray-400">
          Click anywhere to continue
        </p>

      </div>
    </div>
  );
}

export default Splash;