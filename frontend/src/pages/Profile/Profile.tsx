import { FaUserCircle, FaEnvelope, FaUserTag, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import { useLanguage } from "../../context/LanguageContext";

function Profile() {
  const navigate = useNavigate();

  const { language } = useLanguage();

  const isTamil = language === "Tamil";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white">

      {/* NAVBAR */}

      <Navbar />

      {/* MAIN CONTENT */}

      <main className="mx-auto max-w-5xl px-8 py-10">

        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-blue-600 transition hover:bg-blue-50"
        >
          <FaArrowLeft />

          {isTamil
            ? "டாஷ்போர்டுக்குத் திரும்பு"
            : "Back to Dashboard"}
        </button>


        {/* PROFILE CARD */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">

          {/* BLUE HEADER */}

          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-10 text-white">

            <div className="flex items-center gap-6">

              <FaUserCircle className="text-7xl" />

              <div>

                <h1 className="text-3xl font-bold">
                  {isTamil
                    ? "எனது சுயவிவரம்"
                    : "My Profile"}
                </h1>

                <p className="mt-2 text-blue-100">
                  {isTamil
                    ? "உங்கள் MedVerse AI கணக்கு தகவல்கள்"
                    : "Your MedVerse AI account information"}
                </p>

              </div>

            </div>

          </div>


          {/* PROFILE BODY */}

          <div className="p-8">

            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              {isTamil
                ? "சுயவிவர தகவல்கள்"
                : "Profile Information"}
            </h2>


            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* NAME */}

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">

                <div className="mb-4 flex items-center gap-3">

                  <div className="rounded-xl bg-blue-100 p-3 text-blue-600">

                    <FaUserCircle className="text-xl" />

                  </div>

                  <span className="font-semibold text-gray-500">
                    {isTamil
                      ? "பெயர்"
                      : "Name"}
                  </span>

                </div>

                <p className="text-xl font-bold text-gray-800">
                  Shudaryaazhini
                </p>

              </div>


              {/* EMAIL */}

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">

                <div className="mb-4 flex items-center gap-3">

                  <div className="rounded-xl bg-blue-100 p-3 text-blue-600">

                    <FaEnvelope className="text-xl" />

                  </div>

                  <span className="font-semibold text-gray-500">
                    {isTamil
                      ? "மின்னஞ்சல்"
                      : "Email"}
                  </span>

                </div>

                <p className="break-all text-xl font-bold text-gray-800">
                  shudaryaazhini@gmail.com
                </p>

              </div>


              {/* ROLE */}

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">

                <div className="mb-4 flex items-center gap-3">

                  <div className="rounded-xl bg-blue-100 p-3 text-blue-600">

                    <FaUserTag className="text-xl" />

                  </div>

                  <span className="font-semibold text-gray-500">
                    {isTamil
                      ? "பயனர் வகை"
                      : "Role"}
                  </span>

                </div>

                <p className="text-xl font-bold text-gray-800">
                  {isTamil
                    ? "பயனர்"
                    : "User"}
                </p>

              </div>


              {/* ACCOUNT STATUS */}

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">

                <div className="mb-4 flex items-center gap-3">

                  <div className="rounded-xl bg-green-100 p-3 text-green-600">

                    <span className="text-xl">
                      ✓
                    </span>

                  </div>

                  <span className="font-semibold text-gray-500">
                    {isTamil
                      ? "கணக்கு நிலை"
                      : "Account Status"}
                  </span>

                </div>

                <p className="text-xl font-bold text-green-600">
                  {isTamil
                    ? "செயலில் உள்ளது"
                    : "Active"}
                </p>

              </div>

            </div>


            {/* ACCOUNT INFORMATION */}

            <div className="mt-8 rounded-2xl bg-blue-50 p-6">

              <h3 className="text-lg font-bold text-blue-800">
                {isTamil
                  ? "MedVerse AI கணக்கு"
                  : "MedVerse AI Account"}
              </h3>

              <p className="mt-2 leading-7 text-blue-700">

                {isTamil
                  ? "இந்த சுயவிவரம் உங்கள் MedVerse AI மருத்துவ அறிக்கை பகுப்பாய்வு கணக்குடன் தொடர்புடையது."
                  : "This profile is associated with your MedVerse AI medical report analysis account."}

              </p>

            </div>


            {/* BACK BUTTON */}

            <div className="mt-8">

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
              >
                {isTamil
                  ? "டாஷ்போர்டுக்குச் செல்லவும்"
                  : "Go to Dashboard"}
              </button>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Profile;