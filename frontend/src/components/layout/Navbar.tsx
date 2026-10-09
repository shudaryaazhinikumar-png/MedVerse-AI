import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaBell,
  FaUserCircle,
  FaGlobe,
  FaUser,
  FaHistory,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt,
  FaChevronDown,
  FaCheck,
} from "react-icons/fa";

import logo from "../../assets/images/medverselogo.png";
import { useLanguage } from "../../context/LanguageContext";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const navigate = useNavigate();

  const { language, setLanguage } = useLanguage();

  const isTamil = language === "Tamil";

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");

    setOpen(false);
    setLanguageOpen(false);

    navigate("/login");
  };

  // ============================================================
  // LANGUAGE
  // ============================================================

  const selectLanguage = (
    selectedLanguage: "English" | "Tamil"
  ) => {
    setLanguage(selectedLanguage);

    setLanguageOpen(false);
    setOpen(false);
  };

  // ============================================================
  // PROFILE MENU
  // ============================================================

  const toggleProfileMenu = () => {
    setOpen(!open);

    // Close language dropdown if profile menu opens
    setLanguageOpen(false);
  };

  // ============================================================
  // LANGUAGE MENU
  // ============================================================

  const toggleLanguageMenu = () => {
    setLanguageOpen(!languageOpen);

    // Close profile menu if language menu opens
    setOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b bg-white px-8 py-4 shadow-sm">

      {/* =====================================================
          LEFT - LOGO
      ====================================================== */}

      <Link
        to="/dashboard"
        className="flex items-center gap-4"
      >
        <img
          src={logo}
          alt="MedVerse AI"
          className="h-14 w-14 object-contain"
        />

        <div>

          <h1 className="text-2xl font-bold text-blue-700">
            MedVerse AI
          </h1>

          <p className="text-sm text-gray-500">
            {isTamil
              ? "AI பல்மொழி மருத்துவ உதவியாளர்"
              : "AI Multilingual Medical Assistant"}
          </p>

        </div>
      </Link>


      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}

      <div className="flex items-center gap-4">

        {/* =================================================
            GLOBAL LANGUAGE DROPDOWN
        ================================================== */}

        <div className="relative">

          <button
            type="button"
            onClick={toggleLanguageMenu}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm transition hover:border-blue-500 hover:bg-blue-50"
          >

            <FaGlobe className="text-blue-600" />

            <span className="font-medium text-gray-700">
              {isTamil ? "தமிழ்" : "EN"}
            </span>

            <FaChevronDown
              className={`text-xs text-gray-500 transition ${
                languageOpen
                  ? "rotate-180"
                  : ""
              }`}
            />

          </button>


          {/* LANGUAGE OPTIONS */}

          {languageOpen && (

            <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">

              {/* ENGLISH */}

              <button
                type="button"
                onClick={() =>
                  selectLanguage("English")
                }
                className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-blue-50"
              >

                <span className="flex items-center gap-2">
                  🇬🇧

                  <span>
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
                  selectLanguage("Tamil")
                }
                className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-blue-50"
              >

                <span className="flex items-center gap-2">
                  🇮🇳

                  <span>
                    தமிழ்
                  </span>
                </span>

                {language === "Tamil" && (
                  <FaCheck className="text-blue-600" />
                )}

              </button>

            </div>
          )}

        </div>


        {/* =================================================
            NOTIFICATIONS
        ================================================== */}

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setLanguageOpen(false);

            navigate("/notifications");
          }}
          className="relative rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-blue-500 hover:bg-blue-50"
          title={
            isTamil
              ? "அறிவிப்புகள்"
              : "Notifications"
          }
        >

          <FaBell className="text-lg text-blue-600" />

        </button>


        {/* =================================================
            PROFILE AREA
        ================================================== */}

        <div className="relative">

          {/* PROFILE BUTTON */}

          <button
            type="button"
            onClick={toggleProfileMenu}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm transition hover:border-blue-500 hover:bg-blue-50"
          >

            <FaUserCircle className="text-2xl text-blue-600" />

            <span className="font-semibold text-gray-700">
              SK
            </span>

            <FaChevronDown
              className={`text-xs text-gray-500 transition ${
                open
                  ? "rotate-180"
                  : ""
              }`}
            />

          </button>


          {/* =================================================
              PROFILE DROPDOWN
          ================================================== */}

          {open && (

            <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

              {/* =================================================
                  USER HEADER
              ================================================== */}

              <div className="bg-blue-50 p-5">

                <div className="flex items-center gap-3">

                  <FaUserCircle className="text-5xl text-blue-600" />

                  <div>

                    <h3 className="font-bold text-gray-800">
                      Shudaryaazhini
                    </h3>

                    <p className="text-sm text-gray-500">
                      {isTamil
                        ? "MedVerse AI பயனர்"
                        : "MedVerse AI User"}
                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  MY PROFILE
              ================================================== */}

              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-5 py-3 transition hover:bg-gray-100"
              >

                <FaUser className="text-blue-600" />

                {isTamil
                  ? "எனது சுயவிவரம்"
                  : "My Profile"}

              </Link>


              {/* =================================================
                  REPORT HISTORY
              ================================================== */}

              <Link
                to="/history"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-5 py-3 transition hover:bg-gray-100"
              >

                <FaHistory className="text-blue-600" />

                {isTamil
                  ? "அறிக்கை வரலாறு"
                  : "Report History"}

              </Link>


              {/* =================================================
                  SETTINGS
              ================================================== */}

              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-5 py-3 transition hover:bg-gray-100"
              >

                <FaCog className="text-blue-600" />

                {isTamil
                  ? "அமைப்புகள்"
                  : "Settings"}

              </Link>


              {/* =================================================
                  LANGUAGE
              ================================================== */}

              <button
                type="button"
                onClick={toggleLanguageMenu}
                className="flex w-full items-center gap-3 px-5 py-3 transition hover:bg-gray-100"
              >

                <FaGlobe className="text-blue-600" />

                {isTamil
                  ? "மொழி"
                  : "Language"}

                <span className="ml-auto text-sm text-gray-500">
                  {isTamil
                    ? "தமிழ்"
                    : "EN"}
                </span>

              </button>


              {/* =================================================
                  HELP & SUPPORT
              ================================================== */}

              <Link
                to="/help"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-5 py-3 transition hover:bg-gray-100"
              >

                <FaQuestionCircle className="text-blue-600" />

                {isTamil
                  ? "உதவி மற்றும் ஆதரவு"
                  : "Help & Support"}

              </Link>


              {/* =================================================
                  DIVIDER
              ================================================== */}

              <hr />


              {/* =================================================
                  LOGOUT
              ================================================== */}

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-5 py-3 text-red-600 transition hover:bg-red-50"
              >

                <FaSignOutAlt />

                {isTamil
                  ? "வெளியேறு"
                  : "Logout"}

              </button>

            </div>
          )}

        </div>

      </div>

    </nav>
  );
}

export default Navbar;