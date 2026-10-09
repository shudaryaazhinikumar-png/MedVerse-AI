import {
  FaArrowLeft,
  FaBell,
  FaFileMedical,
  FaChartLine,
  FaComments,
  FaCheckCircle,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import { useLanguage } from "../../context/LanguageContext";

function Notifications() {
  const navigate = useNavigate();

  const { language } = useLanguage();

  const isTamil = language === "Tamil";

  const notifications = [
    {
      icon: <FaFileMedical />,
      title: isTamil
        ? "புதிய பகுப்பாய்வு தயார்"
        : "New Analysis Available",
      description: isTamil
        ? "உங்கள் சமீபத்திய மருத்துவ அறிக்கை பகுப்பாய்வு செய்யப்பட்டுள்ளது."
        : "Your latest medical report has been analyzed.",
      time: isTamil
        ? "சமீபத்தில்"
        : "Recently",
    },
    {
      icon: <FaChartLine />,
      title: isTamil
        ? "Progress புதுப்பிக்கப்பட்டது"
        : "Progress Updated",
      description: isTamil
        ? "உங்கள் மருத்துவ முன்னேற்றத் தகவல்கள் புதுப்பிக்கப்பட்டுள்ளன."
        : "Your medical progress information has been updated.",
      time: isTamil
        ? "இன்று"
        : "Today",
    },
    {
      icon: <FaComments />,
      title: isTamil
        ? "AI Medical Chat தயாராக உள்ளது"
        : "AI Medical Chat Ready",
      description: isTamil
        ? "உங்கள் report தொடர்பான கேள்விகளை AI-யிடம் கேட்கலாம்."
        : "You can ask AI questions about your medical report.",
      time: isTamil
        ? "இன்று"
        : "Today",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white">

      <Navbar />

      <main className="mx-auto max-w-4xl p-8">

        {/* BACK */}

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft />

          {isTamil
            ? "டாஷ்போர்டுக்குத் திரும்பு"
            : "Back to Dashboard"}
        </button>


        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold text-gray-800">

              {isTamil
                ? "அறிவிப்புகள்"
                : "Notifications"}

            </h1>

            <p className="mt-2 text-gray-500">

              {isTamil
                ? "உங்கள் MedVerse AI செயல்பாடுகள்."
                : "Your MedVerse AI activity and updates."}

            </p>

          </div>

          <div className="rounded-2xl bg-blue-100 p-4 text-blue-600">

            <FaBell className="text-2xl" />

          </div>

        </div>


        {/* NOTIFICATION LIST */}

        <div className="space-y-4">

          {notifications.map((notification, index) => (

            <div
              key={index}
              className="flex gap-5 rounded-2xl bg-white p-6 shadow-lg transition hover:shadow-xl"
            >

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                {notification.icon}

              </div>

              <div className="flex-1">

                <div className="flex items-start justify-between gap-4">

                  <h2 className="font-bold text-gray-800">

                    {notification.title}

                  </h2>

                  <span className="whitespace-nowrap text-sm text-gray-400">

                    {notification.time}

                  </span>

                </div>

                <p className="mt-2 text-gray-600">

                  {notification.description}

                </p>

              </div>

              <FaCheckCircle className="mt-1 text-green-500" />

            </div>

          ))}

        </div>


        {/* INFO */}

        <div className="mt-8 rounded-2xl bg-blue-50 p-5 text-blue-800">

          <p className="font-medium">

            {isTamil
              ? "இவை தற்போது demo notifications. Semester project-க்கு notification interface தயாராக உள்ளது."
              : "These are currently demo notifications. The notification interface is ready for the semester project."}

          </p>

        </div>

      </main>

    </div>
  );
}

export default Notifications;