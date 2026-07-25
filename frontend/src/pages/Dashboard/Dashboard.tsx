import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaUpload,
  FaFileMedical,
  FaHistory,
  FaComments,
  FaChartLine,
  FaHeartbeat,
  FaArrowUp
} from "react-icons/fa";

import Navbar from "../../components/layout/Navbar";

function Dashboard() {

  const navigate = useNavigate();

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white relative overflow-hidden">

      {/* Background Animation */}

      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity
        }}
        className="absolute top-10 left-10 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 50, 0]
        }}
        transition={{
          duration: 18,
          repeat: Infinity
        }}
        className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <Navbar />

      <main className="relative z-10 p-8">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
        >

          <h2 className="text-4xl font-bold text-blue-700">
            Welcome to MedVerse AI 👋
          </h2>

          <p className="mt-3 text-gray-600 text-lg">
            Your AI-powered multilingual medical assistant.
          </p>

        </motion.div>

        {/* Quick Stats */}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">

          <StatCard
            title="Reports"
            value="12"
            icon={<FaFileMedical />}
            color="blue"
          />

          <StatCard
            title="Health Score"
            value="91%"
            icon={<FaHeartbeat />}
            color="green"
          />

          <StatCard
            title="AI Accuracy"
            value="98%"
            icon={<FaArrowUp />}
            color="purple"
          />

        </div>

        {/* Main Cards */}

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          <DashboardCard
            title="Upload Medical Report"
            description="Upload PDF or image reports"
            icon={<FaUpload />}
            action={() => navigate("/upload")}
          />

          <DashboardCard
            title="AI Analysis"
            description="View generated medical insights"
            icon={<FaFileMedical />}
            action={() => navigate("/analysis")}
          />

          <DashboardCard
            title="Report History"
            description="View previous analysis reports"
            icon={<FaHistory />}
            action={() => navigate("/history")}
          />

          <DashboardCard
            title="AI Medical Chat"
            description="Ask questions in English & Tamil"
            icon={<FaComments />}
            action={() => navigate("/chat")}
          />

          <DashboardCard
            title="Prediction Agent"
            description="Compare previous reports and predict future health trends"
            icon={<FaChartLine />}
            action={() => navigate("/prediction")}
          />

        </div>

        {/* AI Health Insight */}

        <motion.div

          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}

          transition={{ delay: 0.4 }}

          className="mt-10 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white shadow-2xl"

        >

          <h2 className="text-2xl font-bold">

            🤖 Today's AI Health Insight

          </h2>

          <p className="mt-4 leading-8">

            Based on your previous medical reports, your overall health trend
            is stable.

            Your cholesterol and hemoglobin values have improved over the
            past few reports.

            Continue following your doctor's advice and maintain regular
            health check-ups.

          </p>

        </motion.div>

      </main>

    </div>

  );

}

function DashboardCard({
  title,
  description,
  icon,
  action
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
        y: -6
      }}

      whileTap={{
        scale: 0.98
      }}

      onClick={action}

      className="cursor-pointer rounded-3xl bg-white/80 backdrop-blur-md p-8 shadow-lg hover:shadow-2xl border border-blue-100 transition"

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

function StatCard({
  title,
  value,
  icon,
  color
}:{
  title:string;
  value:string;
  icon:React.ReactNode;
  color:string;
}){

  const bg={
    blue:"bg-blue-100 text-blue-700",
    green:"bg-green-100 text-green-700",
    purple:"bg-purple-100 text-purple-700"
  };

  return(

    <motion.div

      whileHover={{scale:1.03}}

      className="rounded-2xl bg-white shadow-lg p-6"

    >

      <div className={`inline-flex rounded-xl p-4 ${bg[color as keyof typeof bg]}`}>

        {icon}

      </div>

      <h3 className="mt-5 text-3xl font-bold">
        {value}
      </h3>

      <p className="text-gray-500 mt-1">
        {title}
      </p>

    </motion.div>

  );

}

export default Dashboard;