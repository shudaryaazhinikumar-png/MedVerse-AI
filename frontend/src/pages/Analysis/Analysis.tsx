import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaDownload,
  FaRobot,
  FaComments,
  FaChartLine,
  FaHistory,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";

function Analysis() {
  const navigate = useNavigate();
  const location = useLocation();

  const report = location.state || {
    category: "Mine",
    relationship: "",
    patientName: "You",
    age: "24 Years",
    reportType: "Blood Test",
    fileName: "blood_report.pdf",
    uploadDate: new Date().toLocaleDateString(),
  };

  const analysisData = getAnalysis(report.reportType);

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <main className="max-w-6xl mx-auto p-8">

        {/* Success Banner */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-green-100 border border-green-300 rounded-2xl p-6 flex items-center gap-4"
        >
          <FaCheckCircle size={35} className="text-green-600" />

          <div>

            <h2 className="text-2xl font-bold text-green-700">
              Analysis Completed Successfully
            </h2>

            <p className="text-gray-600">
              AI Confidence: <b>98%</b> • Report stored in Medical History
            </p>

          </div>

        </motion.div>

        {/* Title */}

        <div className="mt-8">

          <h1 className="text-4xl font-bold text-gray-800">
            Medical Report Analysis
          </h1>

          <p className="text-gray-500 mt-2">
            AI-generated medical interpretation and recommendations.
          </p>

        </div>

        {/* Patient Info */}

        <div className="grid md:grid-cols-3 gap-6 mt-8">

          <InfoCard title="Patient" value={report.patientName} />

          <InfoCard title="Category" value={report.category} />

          <InfoCard title="Age" value={report.age} />

          <InfoCard title="Report Type" value={report.reportType} />

          <InfoCard title="Upload Date" value={report.uploadDate} />

          <InfoCard title="Uploaded File" value={report.fileName} />

        </div>

        {/* Health Status */}

        <div className="grid md:grid-cols-2 gap-6 mt-8">

          <div className="bg-white rounded-2xl shadow p-6">

            <h2 className="text-xl font-bold">
              Health Status
            </h2>

            <div className="mt-4">

              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
                🟢 {analysisData.status}
              </span>

            </div>

            <div className="mt-6">

              <p className="font-semibold">
                AI Health Score
              </p>

              <div className="mt-3 w-full bg-gray-200 rounded-full h-4">

                <div
                  className="bg-green-500 h-4 rounded-full"
                  style={{
                    width: `${analysisData.score}%`,
                  }}
                />

              </div>

              <p className="mt-2 font-bold">
                {analysisData.score}/100
              </p>

            </div>

          </div>

          {/* AI Summary */}

          <div className="bg-white rounded-2xl shadow p-6">

            <div className="flex items-center gap-3">

              <FaRobot className="text-blue-600" />

              <h2 className="text-xl font-bold">
                AI Summary
              </h2>

            </div>

            <p className="mt-5 text-gray-600 leading-8">
              {analysisData.summary}
            </p>

          </div>

        </div>

        {/* Indicators */}

        <div className="bg-white rounded-2xl shadow p-6 mt-8">

          <h2 className="text-xl font-bold">
            Detected Health Indicators
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mt-5">

            {analysisData.indicators.map((item) => (

              <div
                key={item}
                className="bg-gray-50 rounded-xl p-4"
              >
                ✓ {item}
              </div>

            ))}

          </div>

        </div>

        {/* Recommendations */}

        <div className="bg-white rounded-2xl shadow p-6 mt-8">

          <h2 className="text-xl font-bold">
            AI Recommendations
          </h2>

          <ul className="mt-5 space-y-3">

            {analysisData.recommendations.map((item) => (

              <li key={item}>
                ✓ {item}
              </li>

            ))}

          </ul>

        </div>

        {/* Quick Actions */}

        <div className="grid md:grid-cols-4 gap-5 mt-10">

          <ActionCard
            icon={<FaComments />}
            title="AI Chat"
            color="bg-blue-600"
            onClick={() => navigate("/chat", { state: report })}
          />

          <ActionCard
            icon={<FaChartLine />}
            title="Prediction"
            color="bg-purple-600"
            onClick={() => navigate("/prediction", { state: report })}
          />

          <ActionCard
            icon={<FaHistory />}
            title="History"
            color="bg-green-600"
            onClick={() => navigate("/history")}
          />

          <ActionCard
            icon={<FaDownload />}
            title="Download"
            color="bg-orange-600"
            onClick={() => alert("Coming Soon")}
          />

        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-10 flex items-center gap-2 text-blue-600"
        >
          <FaArrowLeft />
          Back to Dashboard
        </button>

      </main>

    </div>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">

      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <h3 className="text-xl font-bold mt-2">
        {value}
      </h3>

    </div>
  );
}

function ActionCard({
  icon,
  title,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`${color} rounded-2xl text-white p-6 shadow hover:scale-105 transition`}
    >
      <div className="text-3xl">{icon}</div>

      <h3 className="mt-3 font-bold">
        {title}
      </h3>

    </button>
  );
}

function getAnalysis(type: string) {
  if (type.includes("Diabetes")) {
    return {
      status: "Needs Monitoring",
      score: 78,
      summary:
        "Blood glucose levels appear elevated. HbA1c indicates diabetic condition. Regular monitoring and medication are advised.",
      indicators: [
        "Fasting Blood Sugar",
        "HbA1c",
        "Post Meal Sugar",
        "Insulin Resistance",
      ],
      recommendations: [
        "Reduce sugar intake",
        "Exercise daily",
        "Continue medication",
        "Repeat test after 3 months",
      ],
    };
  }

  if (type.includes("Heart")) {
    return {
      status: "Moderate Risk",
      score: 74,
      summary:
        "Blood pressure and cholesterol require monitoring. Lifestyle improvements are recommended.",
      indicators: [
        "Blood Pressure",
        "LDL",
        "HDL",
        "Triglycerides",
      ],
      recommendations: [
        "Reduce salt",
        "Exercise 30 mins",
        "Consult cardiologist",
        "Repeat lipid profile",
      ],
    };
  }

  return {
    status: "Healthy",
    score: 92,
    summary:
      "Hemoglobin, RBC, WBC and platelet counts are within normal limits. No significant abnormalities detected.",
    indicators: [
      "Hemoglobin",
      "RBC",
      "WBC",
      "Platelets",
    ],
    recommendations: [
      "Maintain healthy diet",
      "Drink more water",
      "Exercise regularly",
      "Routine annual health check",
    ],
  };
}

export default Analysis;