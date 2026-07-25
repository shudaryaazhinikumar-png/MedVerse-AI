import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "react-icons/fa";

import logo from "../../assets/images/medverselogo.png";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b bg-white px-8 py-4 shadow-sm">

      {/* Left */}
      <Link to="/dashboard" className="flex items-center gap-4">

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
            AI Multilingual Medical Assistant
          </p>

        </div>

      </Link>

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* Language */}

        <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm transition hover:border-blue-500 hover:bg-blue-50">

          <FaGlobe className="text-blue-600" />

          <span className="font-medium text-gray-700">
            EN
          </span>

          <FaChevronDown className="text-xs text-gray-500" />

        </button>



        {/* Notifications */}

        <button className="relative rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-blue-500 hover:bg-blue-50">

          <FaBell className="text-blue-600 text-lg" />

          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">

            2

          </span>

        </button>



        {/* Profile */}

        <div className="relative">

          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm transition hover:border-blue-500 hover:bg-blue-50"
          >

            <FaUserCircle className="text-2xl text-blue-600" />

            <span className="font-semibold text-gray-700">
              SK
            </span>

            <FaChevronDown className="text-xs text-gray-500" />

          </button>

          {open && (

            <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border bg-white shadow-2xl">

              {/* User */}

              <div className="bg-blue-50 p-5">

                <div className="flex items-center gap-3">

                  <FaUserCircle className="text-5xl text-blue-600" />

                  <div>

                    <h3 className="font-bold text-gray-800">
                      Shudaryaazhini
                    </h3>

                    <p className="text-sm text-gray-500">
                      Demo Account
                    </p>

                  </div>

                </div>

              </div>



              <Link
                to="/profile"
                className="flex items-center gap-3 px-5 py-3 transition hover:bg-gray-100"
              >
                <FaUser className="text-blue-600" />
                My Profile
              </Link>

              <Link
                to="/history"
                className="flex items-center gap-3 px-5 py-3 transition hover:bg-gray-100"
              >
                <FaHistory className="text-blue-600" />
                Report History
              </Link>

              <Link
                to="/settings"
                className="flex items-center gap-3 px-5 py-3 transition hover:bg-gray-100"
              >
                <FaCog className="text-blue-600" />
                Settings
              </Link>

              <button className="flex w-full items-center gap-3 px-5 py-3 transition hover:bg-gray-100">

                <FaGlobe className="text-blue-600" />

                Language

              </button>

              <button className="flex w-full items-center gap-3 px-5 py-3 transition hover:bg-gray-100">

                <FaQuestionCircle className="text-blue-600" />

                Help & Support

              </button>

              <hr />

              <button className="flex w-full items-center gap-3 px-5 py-3 text-red-600 transition hover:bg-red-50">

                <FaSignOutAlt />

                Logout

              </button>

            </div>

          )}

        </div>

      </div>

    </nav>
  );
}

export default Navbar;