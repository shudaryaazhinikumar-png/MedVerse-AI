import {
  FaArrowLeft,
  FaGlobe,
  FaVolumeUp,
  FaLock,
  FaInfoCircle,
  FaCheck,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import { useLanguage } from "../../context/LanguageContext";

function Settings() {
  const navigate = useNavigate();

  const {
    language,
    setLanguage,
  } = useLanguage();

  const isTamil = language === "Tamil";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white">

      <Navbar />

      <main className="mx-auto max-w-4xl p-8">

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

        <div className="rounded-3xl bg-white p-8 shadow-xl">

          {/* TITLE */}

          <div className="mb-8">

            <h1 className="text-3xl font-bold text-gray-800">
              {isTamil
                ? "அமைப்புகள்"
                : "Settings"}
            </h1>

            <p className="mt-2 text-gray-500">
              {isTamil
                ? "MedVerse AI பயன்பாட்டு அமைப்புகளை நிர்வகிக்கவும்."
                : "Manage your MedVerse AI application preferences."}
            </p>

          </div>

          {/* =================================================
              LANGUAGE
          ================================================== */}

          <section className="mb-6 rounded-2xl border border-gray-100 p-6">

            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-blue-100 p-4 text-blue-600">
                <FaGlobe className="text-xl" />
              </div>

              <div className="flex-1">

                <h2 className="text-xl font-bold text-gray-800">
                  {isTamil
                    ? "மொழி"
                    : "Language"}
                </h2>

                <p className="mt-1 text-gray-500">
                  {isTamil
                    ? "பயன்பாட்டின் மொழியைத் தேர்ந்தெடுக்கவும்."
                    : "Choose your application language."}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">

                  {/* ENGLISH */}

                  <button
                    type="button"
                    onClick={() =>
                      setLanguage("English")
                    }
                    className={`flex items-center justify-between rounded-xl border p-4 transition ${
                      language === "English"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      🇬🇧
                      <span className="font-semibold">
                        English
                      </span>
                    </span>

                    {language === "English" && (
                      <FaCheck className="text-blue-600" />
                    )}
                  </button>

                  {/* TAMIL */}

                  <button
                    type="button"
                    onClick={() =>
                      setLanguage("Tamil")
                    }
                    className={`flex items-center justify-between rounded-xl border p-4 transition ${
                      language === "Tamil"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      🇮🇳
                      <span className="font-semibold">
                        தமிழ்
                      </span>
                    </span>

                    {language === "Tamil" && (
                      <FaCheck className="text-blue-600" />
                    )}
                  </button>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              VOICE
          ================================================== */}

          <section className="mb-6 rounded-2xl border border-gray-100 p-6">

            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-purple-100 p-4 text-purple-600">
                <FaVolumeUp className="text-xl" />
              </div>

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  {isTamil
                    ? "குரல்"
                    : "Voice"}
                </h2>

                <p className="mt-1 text-gray-500">
                  {isTamil
                    ? "AI குரல் பதில் Chat பக்கத்தில் கிடைக்கிறது."
                    : "AI voice responses are available in the Chat page."}
                </p>

              </div>

            </div>

          </section>

          {/* =================================================
              SECURITY
          ================================================== */}

          <section className="mb-6 rounded-2xl border border-gray-100 p-6">

            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-green-100 p-4 text-green-600">
                <FaLock className="text-xl" />
              </div>

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  {isTamil
                    ? "பாதுகாப்பு"
                    : "Security"}
                </h2>

                <p className="mt-1 text-gray-500">
                  {isTamil
                    ? "உங்கள் கணக்கு JWT authentication மூலம் பாதுகாக்கப்படுகிறது."
                    : "Your account is protected using JWT authentication."}
                </p>

              </div>

            </div>

          </section>

          {/* =================================================
              ABOUT
          ================================================== */}

          <section className="rounded-2xl border border-gray-100 p-6">

            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-cyan-100 p-4 text-cyan-600">
                <FaInfoCircle className="text-xl" />
              </div>

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  {isTamil
                    ? "MedVerse AI பற்றி"
                    : "About MedVerse AI"}
                </h2>

                <p className="mt-1 text-gray-500">
                  {isTamil
                    ? "AI அடிப்படையிலான பல்மொழி மருத்துவ அறிக்கை பகுப்பாய்வு அமைப்பு."
                    : "AI-powered multilingual medical report analysis system."}
                </p>

                <p className="mt-3 text-sm text-gray-400">
                  {isTamil
                    ? "பதிப்பு 1.0"
                    : "Version 1.0"}
                </p>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default Settings;