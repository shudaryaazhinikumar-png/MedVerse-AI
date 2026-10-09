import { motion } from "framer-motion";

import {
  FaFileMedical,
  FaEye,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

import axios from "axios";

import { useLanguage } from "../../context/LanguageContext";


// ============================================================
// REPORT INTERFACE
// ============================================================

interface Report {
  _id: string;

  filename?: string;

  report_type?: string;

  created_at?: string;

  patient_type?: string;

  patient_name?: string;

  patient_age?: number | string;

  family_member_id?: string | null;

  family_member_name?: string;

  family_member_relationship?: string;

  family_member_age?: number | string;

  parsed_report?: any;

  ai_analysis?: any;
}


// ============================================================
// COMPONENT
// ============================================================

function MyReports() {

  const navigate = useNavigate();

  // ============================================================
  // GLOBAL LANGUAGE
  // ============================================================

  const { language } = useLanguage();

  const isTamil =
    language === "Tamil";


  // ============================================================
  // STATE
  // ============================================================

  const [reports, setReports] =
    useState<Report[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ============================================================
  // FETCH ONLY MY REPORTS
  // ============================================================

  const fetchReports = async () => {

    try {

      setLoading(true);

      setError("");


      const token =
        localStorage.getItem(
          "access_token"
        );


      if (!token) {

        navigate("/login");

        return;

      }


      const response =
        await axios.get(
          "http://127.0.0.1:8000/reports/my-reports",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      console.log(
        "All reports from backend:",
        response.data
      );


      // ========================================================
      // BACKEND CURRENTLY RETURNS:
      //
      // self reports
      // family reports
      //
      // My Reports must show ONLY self reports.
      // ========================================================

      const allReports: Report[] =
        response.data.reports || [];


      const myReports =
        allReports.filter(
          (report) =>
            report.patient_type ===
            "self"
        );


      console.log(
        "ONLY MY REPORTS:",
        myReports
      );


      setReports(
        myReports
      );


    } catch (error: any) {

      console.error(
        "Failed to fetch reports:",
        error
      );


      if (
        error.response?.status === 401
      ) {

        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "token_type"
        );

        navigate("/login");

        return;

      }


      setError(
        error.response?.data?.detail ||
          (
            isTamil
              ? "உங்கள் அறிக்கைகளை ஏற்ற முடியவில்லை"
              : "Unable to load your reports"
          )
      );


    } finally {

      setLoading(false);

    }

  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    fetchReports();

  }, []);


  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatDate = (
    dateString?: string
  ) => {

    if (!dateString) {

      return "--";

    }


    const date =
      new Date(dateString);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "--";

    }


    return date.toLocaleDateString(
      isTamil ? "ta-IN" : "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

  };


  // ============================================================
  // VIEW MY REPORT
  // ============================================================

  const handleViewReport = (
    report: Report
  ) => {

    navigate(
      "/analysis",
      {
        state: {

          category:
            "Mine",

          patient_type:
            "self",

          patientName:
            report.patient_name ||
            "You",

          relationship:
            "Self",

          age:
            report.patient_age ||
            "--",

          reportType:
            report.report_type ||
            "Medical Report",

          fileName:
            report.filename ||
            "Medical Report",

          uploadDate:
            formatDate(
              report.created_at
            ),

          reportId:
            report._id,

          analysis:
            report,
        },
      }
    );

  };


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="flex justify-center items-center py-20">

        <p className="text-gray-500 text-lg">

          {isTamil
            ? "உங்கள் அறிக்கைகள் ஏற்றப்படுகின்றன..."
            : "Loading your reports..."
          }

        </p>

      </div>

    );

  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error) {

    return (

      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">

        <p className="text-red-600 font-medium">

          {error}

        </p>


        <button
          type="button"
          onClick={fetchReports}
          className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >

          {isTamil
            ? "மீண்டும் முயற்சிக்கவும்"
            : "Try Again"
          }

        </button>

      </div>

    );

  }


  // ============================================================
  // NO PERSONAL REPORTS
  // ============================================================

  if (reports.length === 0) {

    return (

      <div className="bg-white rounded-2xl shadow p-10 text-center">

        <FaFileMedical
          className="mx-auto text-5xl text-gray-300"
        />


        <h3 className="text-xl font-bold mt-4">

          {isTamil
            ? "தனிப்பட்ட அறிக்கைகள் எதுவும் இல்லை"
            : "No Personal Reports Found"
          }

        </h3>


        <p className="text-gray-500 mt-2">

          {isTamil
            ? "உங்கள் தனிப்பட்ட மருத்துவ அறிக்கைகள் இங்கே தோன்றும்."
            : "Your personal medical reports will appear here."
          }

        </p>


        <button
          type="button"
          onClick={() =>
            navigate("/upload")
          }
          className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
        >

          {isTamil
            ? "எனது அறிக்கையை பதிவேற்றவும்"
            : "Upload My Report"
          }

        </button>

      </div>

    );

  }


  // ============================================================
  // MY REPORTS
  // ============================================================

  return (

    <div className="space-y-5">

      {reports.map(
        (report) => (

          <motion.div
            key={report._id}
            whileHover={{
              scale: 1.01,
            }}
            className="bg-white rounded-2xl shadow p-6"
          >

            <div className="flex flex-col gap-5 md:flex-row md:justify-between md:items-center">


              {/* ================================================= */}
              {/* REPORT INFORMATION */}
              {/* ================================================= */}

              <div className="flex gap-5 items-start">


                <div className="bg-blue-100 p-4 rounded-xl text-blue-600 text-3xl">

                  <FaFileMedical />

                </div>


                <div>


                  {/* FILE NAME */}

                  <h3 className="text-xl font-bold">

                    {report.filename ||
                      (
                        isTamil
                          ? "மருத்துவ அறிக்கை"
                          : "Medical Report"
                      )
                    }

                  </h3>


                  {/* REPORT TYPE */}

                  <p className="text-gray-500">

                    {report.report_type ||
                      (
                        isTamil
                          ? "மருத்துவ அறிக்கை"
                          : "Medical Report"
                      )
                    }

                  </p>


                  {/* PERSONAL REPORT */}

                  <p className="mt-1 text-blue-600 font-medium">

                    {isTamil
                      ? "எனது அறிக்கை"
                      : "My Report"
                    }

                  </p>


                  {/* DATE */}

                  <p className="text-gray-400 text-sm mt-1">

                    {formatDate(
                      report.created_at
                    )}

                  </p>


                  {/* ANALYZED */}

                  <span className="inline-block mt-2 text-green-600 text-sm font-medium">

                    ✓{" "}

                    {isTamil
                      ? "பகுப்பாய்வு செய்யப்பட்டது"
                      : "Analyzed"
                    }

                  </span>


                </div>

              </div>


              {/* ================================================= */}
              {/* VIEW REPORT */}
              {/* ================================================= */}

              <button
                type="button"
                onClick={() =>
                  handleViewReport(
                    report
                  )
                }
                className="flex gap-2 items-center justify-center text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-xl px-5 py-3 hover:bg-blue-50"
              >

                <FaEye />

                {isTamil
                  ? "அறிக்கையைப் பார்க்க"
                  : "View Report"
                }

              </button>


            </div>

          </motion.div>

        )
      )}

    </div>

  );

}


export default MyReports;