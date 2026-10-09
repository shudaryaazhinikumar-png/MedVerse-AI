import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  FaUpload,
  FaFileMedical,
  FaHistory,
  FaComments,
  FaChartLine,
  FaHeartbeat,
  FaArrowUp,
} from "react-icons/fa";

import Navbar from "../../components/layout/Navbar";
import { useLanguage } from "../../context/LanguageContext";

function Dashboard() {
  const navigate = useNavigate();

  const { language } = useLanguage();

  const isTamil = language === "Tamil";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-white">

      {/* =====================================================
          BACKGROUND ANIMATION
      ====================================================== */}

      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
        }}
        className="absolute left-10 top-10 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
        }}
        className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <Navbar />

      <main className="relative z-10 p-8">

        {/* =================================================
            WELCOME
        ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <h2 className="text-4xl font-bold text-blue-700">
            {isTamil
              ? "MedVerse AI-க்கு வரவேற்கிறோம் 👋"
              : "Welcome to MedVerse AI 👋"}
          </h2>

          <p className="mt-3 text-lg text-gray-600">
            {isTamil
              ? "உங்கள் AI அடிப்படையிலான பல்மொழி மருத்துவ உதவியாளர்."
              : "Your AI-powered multilingual medical assistant."}
          </p>
        </motion.div>

        {/* =================================================
            QUICK STATS
        ================================================== */}

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">

          <StatCard
            title={isTamil ? "அறிக்கைகள்" : "Reports"}
            value="12"
            icon={<FaFileMedical />}
            color="blue"
          />

          <StatCard
            title={isTamil ? "ஆரோக்கிய மதிப்பெண்" : "Health Score"}
            value="91%"
            icon={<FaHeartbeat />}
            color="green"
          />

          <StatCard
            title={isTamil ? "AI துல்லியம்" : "AI Accuracy"}
            value="98%"
            icon={<FaArrowUp />}
            color="purple"
          />

        </div>

        {/* =================================================
            MAIN CARDS
        ================================================== */}

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">

          <DashboardCard
            title={
              isTamil
                ? "மருத்துவ அறிக்கையை பதிவேற்றவும்"
                : "Upload Medical Report"
            }
            description={
              isTamil
                ? "PDF அல்லது பட அறிக்கைகளை பதிவேற்றவும்"
                : "Upload PDF or image reports"
            }
            icon={<FaUpload />}
            action={() => navigate("/upload")}
          />

          <DashboardCard
            title={isTamil ? "AI பகுப்பாய்வு" : "AI Analysis"}
            description={
              isTamil
                ? "உருவாக்கப்பட்ட மருத்துவ தகவல்களைப் பார்க்கவும்"
                : "View generated medical insights"
            }
            icon={<FaFileMedical />}
            action={() => navigate("/analysis")}
          />

          <DashboardCard
            title={
              isTamil
                ? "அறிக்கை வரலாறு"
                : "Report History"
            }
            description={
              isTamil
                ? "முந்தைய பகுப்பாய்வு அறிக்கைகளைப் பார்க்கவும்"
                : "View previous analysis reports"
            }
            icon={<FaHistory />}
            action={() => navigate("/history")}
          />

          <DashboardCard
            title={
              isTamil
                ? "AI மருத்துவ உரையாடல்"
                : "AI Medical Chat"
            }
            description={
              isTamil
                ? "ஆங்கிலம் மற்றும் தமிழில் கேள்விகளைக் கேளுங்கள்"
                : "Ask questions in English & Tamil"
            }
            icon={<FaComments />}
            action={() => navigate("/chat")}
          />

          <DashboardCard
            title={
              isTamil
                ? "முன்கணிப்பு உதவியாளர்"
                : "Prediction Agent"
            }
            description={
              isTamil
                ? "முந்தைய அறிக்கைகளை ஒப்பிட்டு எதிர்கால ஆரோக்கிய போக்குகளைப் பார்க்கவும்"
                : "Compare previous reports and predict future health trends"
            }
            icon={<FaChartLine />}
            action={() => navigate("/prediction")}
          />

        </div>

        {/* =================================================
            AI HEALTH INSIGHT
        ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.4,
          }}
          className="mt-10 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white shadow-2xl"
        >
          <h2 className="text-2xl font-bold">
            {isTamil
              ? "🤖 இன்றைய AI ஆரோக்கிய தகவல்"
              : "🤖 Today's AI Health Insight"}
          </h2>

          <p className="mt-4 leading-8">
            {isTamil
              ? "உங்கள் முந்தைய மருத்துவ அறிக்கைகளின் அடிப்படையில், உங்கள் ஒட்டுமொத்த ஆரோக்கியப் போக்கு நிலையாக உள்ளது. உங்கள் கொலஸ்ட்ரால் மற்றும் ஹீமோகுளோபின் அளவுகள் கடந்த சில அறிக்கைகளில் மேம்பட்டுள்ளன. உங்கள் மருத்துவரின் ஆலோசனையைப் பின்பற்றி, வழக்கமான ஆரோக்கிய பரிசோதனைகளை மேற்கொள்ளுங்கள்."
              : "Based on your previous medical reports, your overall health trend is stable. Your cholesterol and hemoglobin values have improved over the past few reports. Continue following your doctor's advice and maintain regular health check-ups."}
          </p>
        </motion.div>

      </main>

    </div>
  );
}

/* ============================================================
   DASHBOARD CARD
============================================================ */

function DashboardCard({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}) {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        y: -6,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={action}
      className="cursor-pointer rounded-3xl border border-blue-100 bg-white/80 p-8 shadow-lg backdrop-blur-md transition hover:shadow-2xl"
    >
      <div className="text-5xl text-blue-600">
        {icon}
      </div>

      <h3 className="mt-6 text-2xl font-bold text-gray-800">
        {title}
      </h3>

      <p className="mt-3 text-gray-600">
        {description}
      </p>
    </motion.div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  const bg = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <motion.div
      whileHover={{
        scale: 1.03,
      }}
      className="rounded-2xl bg-white p-6 shadow-lg"
    >
      <div
        className={`inline-flex rounded-xl p-4 ${
          bg[color as keyof typeof bg]
        }`}
      >
        {icon}
      </div>

      <h3 className="mt-5 text-3xl font-bold">
        {value}
      </h3>

      <p className="mt-1 text-gray-500">
        {title}
      </p>
    </motion.div>
  );
}

export default Dashboard;