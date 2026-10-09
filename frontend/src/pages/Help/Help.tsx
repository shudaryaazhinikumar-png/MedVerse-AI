import {
  FaArrowLeft,
  FaQuestionCircle,
  FaUpload,
  FaComments,
  FaMicrophone,
  FaEnvelope,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import { useLanguage } from "../../context/LanguageContext";

function Help() {
  const navigate = useNavigate();

  const { language } = useLanguage();

  const isTamil = language === "Tamil";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white">

      <Navbar />

      <main className="mx-auto max-w-5xl p-8">

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

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-800">
            {isTamil
              ? "உதவி மற்றும் ஆதரவு"
              : "Help & Support"}
          </h1>

          <p className="mt-2 text-gray-500">
            {isTamil
              ? "MedVerse AI-ஐ பயன்படுத்துவதற்கான உதவி."
              : "Get help using MedVerse AI."}
          </p>

        </div>


        {/* HELP CARDS */}

        <div className="grid gap-6 md:grid-cols-2">

          {/* UPLOAD */}

          <div className="rounded-3xl bg-white p-6 shadow-lg">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">

              <FaUpload className="text-2xl" />

            </div>

            <h2 className="text-xl font-bold text-gray-800">

              {isTamil
                ? "மருத்துவ அறிக்கையை பதிவேற்றுவது எப்படி?"
                : "How do I upload a medical report?"}

            </h2>

            <p className="mt-3 leading-7 text-gray-600">

              {isTamil
                ? "Upload பக்கத்திற்குச் சென்று PDF அல்லது image medical report-ஐ தேர்ந்தெடுத்து analysis செய்யலாம்."
                : "Go to the Upload page, select a PDF or image medical report, and start the analysis."}

            </p>

          </div>


          {/* CHAT */}

          <div className="rounded-3xl bg-white p-6 shadow-lg">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">

              <FaComments className="text-2xl" />

            </div>

            <h2 className="text-xl font-bold text-gray-800">

              {isTamil
                ? "AI Chat எப்படி பயன்படுத்துவது?"
                : "How do I use AI Medical Chat?"}

            </h2>

            <p className="mt-3 leading-7 text-gray-600">

              {isTamil
                ? "உங்கள் medical report தொடர்பான கேள்விகளை தமிழிலோ ஆங்கிலத்திலோ கேட்கலாம்."
                : "You can ask questions about your medical report in English or Tamil."}

            </p>

          </div>


          {/* VOICE */}

          <div className="rounded-3xl bg-white p-6 shadow-lg">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">

              <FaMicrophone className="text-2xl" />

            </div>

            <h2 className="text-xl font-bold text-gray-800">

              {isTamil
                ? "குரல் வசதி"
                : "Voice Features"}

            </h2>

            <p className="mt-3 leading-7 text-gray-600">

              {isTamil
                ? "Chat பக்கத்தில் microphone பயன்படுத்தி கேள்விகளைப் பேசலாம். AI பதில்களை குரலாகவும் கேட்கலாம்."
                : "Use the microphone on the Chat page to ask questions by voice. AI responses can also be spoken aloud."}

            </p>

          </div>


          {/* CONTACT */}

          <div className="rounded-3xl bg-white p-6 shadow-lg">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600">

              <FaEnvelope className="text-2xl" />

            </div>

            <h2 className="text-xl font-bold text-gray-800">

              {isTamil
                ? "மேலும் உதவி தேவைப்படுகிறதா?"
                : "Need more help?"}

            </h2>

            <p className="mt-3 leading-7 text-gray-600">

              {isTamil
                ? "MedVerse AI project support-க்கு project administrator-ஐ தொடர்பு கொள்ளவும்."
                : "For MedVerse AI project support, contact the project administrator."}

            </p>

          </div>

        </div>


        {/* DISCLAIMER */}

        <div className="mt-8 flex gap-4 rounded-2xl bg-blue-50 p-6 text-blue-800">

          <FaQuestionCircle className="mt-1 shrink-0" />

          <p className="leading-7">

            {isTamil
              ? "MedVerse AI பொதுவான மருத்துவ தகவல்களை வழங்குகிறது. இது மருத்துவரின் diagnosis அல்லது medical advice-க்கு மாற்றாகாது."
              : "MedVerse AI provides general medical information and is not a replacement for professional medical diagnosis or medical advice."}

          </p>

        </div>

      </main>

    </div>
  );
}

export default Help;