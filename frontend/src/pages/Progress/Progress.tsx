import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import { motion } from "framer-motion";

import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";


// ==========================================================
// TYPES
// ==========================================================

interface Measurement {
  report_id: string;
  date: string;
  value: number;
  status: string;

  reference_range?: {
    low: number;
    high: number;
  } | null;

  filename?: string;
}

interface Trend {
  test_name: string;
  unit: string;
  measurements: Measurement[];

  first_value: number;
  latest_value: number;
  previous_value: number | null;

  change: number;
  percentage_change: number | null;
  direction: string;
}

interface Report {
  report_id: string;
  filename: string;
  report_type: string;
  created_at: string;

  patient_name?: string | null;
  patient_type: string;
  family_member_id?: string | null;
}

interface ProgressResponse {
  patient_type: string;
  family_member_id: string | null;

  report_count: number;
  reports: Report[];
  trends: Trend[];

  message: string;
}


// ==========================================================
// HELPER FUNCTIONS
// ==========================================================

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function getStatusClass(status: string) {
  switch (status?.toLowerCase()) {
    case "normal":
      return "bg-green-100 text-green-700";

    case "high":
      return "bg-red-100 text-red-700";

    case "low":
      return "bg-orange-100 text-orange-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
}


function getDirectionIcon(direction: string) {
  if (direction === "increased") {
    return <TrendingUp size={18} />;
  }

  if (direction === "decreased") {
    return <TrendingDown size={18} />;
  }

  return <Minus size={18} />;
}


// ==========================================================
// MAIN COMPONENT
// ==========================================================

export default function Progress() {
  const [data, setData] =
    useState<ProgressResponse | null>(null);

  const [selectedTest, setSelectedTest] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ========================================================
  // GEMINI AI SUMMARY STATES
  // ========================================================

  const [summaryLanguage, setSummaryLanguage] =
    useState<"English" | "Tamil">("English");

  const [aiSummary, setAiSummary] =
    useState("");

  const [summaryLoading, setSummaryLoading] =
    useState(false);

  const [summaryError, setSummaryError] =
    useState("");


  // ==========================================================
  // FETCH PROGRESS
  // ==========================================================

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("access_token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(
        `${API_URL}/reports/progress?patient_type=self`,
        {
          method: "GET",

          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Session expired. Please login again."
          );
        }

        throw new Error(
          `Unable to load progress. Status: ${response.status}`
        );
      }

      const result: ProgressResponse =
        await response.json();

      setData(result);

      // Automatically select first available test
      if (
        result.trends.length > 0 &&
        !selectedTest
      ) {
        setSelectedTest(
          result.trends[0].test_name +
            "|" +
            result.trends[0].unit
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load report progress."
      );
    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // GEMINI AI PROGRESS SUMMARY
  // ==========================================================

  const generateAISummary = async () => {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      setSummaryError("Please login again.");
      return;
    }

    try {
      setSummaryLoading(true);
      setSummaryError("");
      setAiSummary("");

      const response = await fetch(
        `${API_URL}/reports/progress/summary`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            patient_type: "self",
            language: summaryLanguage,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
            "Unable to generate AI summary."
        );
      }

      setAiSummary(
        result.summary || ""
      );
    } catch (err) {
      console.error(
        "AI summary error:",
        err
      );

      setSummaryError(
        err instanceof Error
          ? err.message
          : "Unable to generate AI summary."
      );
    } finally {
      setSummaryLoading(false);
    }
  };


  // ==========================================================
  // LOAD PROGRESS
  // ==========================================================

  useEffect(() => {
    fetchProgress();
  }, []);


  // ==========================================================
  // SELECTED TREND
  // ==========================================================

  const selectedTrend = useMemo(() => {
    if (!data || !selectedTest) {
      return null;
    }

    return (
      data.trends.find(
        (trend) =>
          `${trend.test_name}|${trend.unit}` ===
          selectedTest
      ) || null
    );
  }, [data, selectedTest]);


  // ==========================================================
  // CHART DATA
  // ==========================================================

  const chartData = useMemo(() => {
    if (!selectedTrend) {
      return [];
    }

    return selectedTrend.measurements.map(
      (measurement) => ({
        date: formatDate(
          measurement.date
        ),

        value: measurement.value,

        status: measurement.status,
      })
    );
  }, [selectedTrend]);


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="text-center">

          <RefreshCw
            className="mx-auto mb-4 animate-spin text-blue-600"
            size={36}
          />

          <p className="text-gray-600">
            Loading health progress...
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">

          <AlertCircle
            className="mx-auto mb-4 text-red-500"
            size={48}
          />

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Unable to Load Progress
          </h2>

          <p className="text-gray-600 mb-6">
            {error}
          </p>

          <button
            onClick={fetchProgress}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }


  // ==========================================================
  // NO DATA
  // ==========================================================

  if (!data) {
    return null;
  }


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="bg-white shadow-sm border-b">

        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="p-3 bg-blue-100 rounded-xl">

              <Activity
                className="text-blue-600"
                size={28}
              />

            </div>

            <div>

              <h1 className="text-2xl font-bold text-gray-800">
                Health Progress
              </h1>

              <p className="text-sm text-gray-500">
                Longitudinal medical report comparison
              </p>

            </div>

          </div>


          <button
            onClick={fetchProgress}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >

            <RefreshCw size={17} />

            Refresh

          </button>

        </div>

      </header>


      {/* ======================================================
          CONTENT
      ====================================================== */}

      <main className="max-w-7xl mx-auto px-6 py-8">


        {/* ====================================================
            SUMMARY CARDS
        ==================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">


          {/* REPORTS */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="bg-white rounded-2xl shadow-sm p-6 border"
          >

            <p className="text-sm text-gray-500">
              Reports Analyzed
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              {data.report_count}
            </p>

          </motion.div>


          {/* TESTS */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                delay: 0.1,
              },
            }}
            className="bg-white rounded-2xl shadow-sm p-6 border"
          >

            <p className="text-sm text-gray-500">
              Tests With Trends
            </p>

            <p className="text-3xl font-bold text-cyan-600 mt-2">
              {data.trends.length}
            </p>

          </motion.div>


          {/* PATIENT */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                delay: 0.2,
              },
            }}
            className="bg-white rounded-2xl shadow-sm p-6 border"
          >

            <p className="text-sm text-gray-500">
              Patient
            </p>

            <p className="text-3xl font-bold text-gray-800 mt-2">
              You
            </p>

          </motion.div>

        </div>


        {/* ====================================================
            NO TRENDS
        ==================================================== */}

        {data.trends.length === 0 ? (

          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">

            <Activity
              className="mx-auto mb-4 text-gray-400"
              size={50}
            />

            <h2 className="text-xl font-bold text-gray-800">
              Not Enough Reports Yet
            </h2>

            <p className="text-gray-500 mt-2">
              Upload at least two reports containing
              the same test to generate a trend.
            </p>

          </div>

        ) : (

          <>


            {/* ================================================
                TEST SELECTOR
            ================================================= */}

            <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Test
              </label>

              <select
                value={selectedTest}
                onChange={(e) =>
                  setSelectedTest(
                    e.target.value
                  )
                }
                className="w-full md:w-96 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >

                {data.trends.map(
                  (trend) => (

                    <option
                      key={`${trend.test_name}|${trend.unit}`}
                      value={`${trend.test_name}|${trend.unit}`}
                    >

                      {trend.test_name}{" "}

                      {trend.unit
                        ? `(${trend.unit})`
                        : ""}

                    </option>

                  )
                )}

              </select>

            </div>


            {/* ================================================
                SELECTED TEST
            ================================================= */}

            {selectedTrend && (

              <>


                {/* ==========================================
                    TEST SUMMARY CARDS
                =========================================== */}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">


                  {/* FIRST VALUE */}

                  <div className="bg-white rounded-2xl shadow-sm border p-5">

                    <p className="text-sm text-gray-500">
                      First Value
                    </p>

                    <p className="text-2xl font-bold text-gray-800 mt-1">

                      {selectedTrend.first_value}{" "}

                      <span className="text-sm font-normal">
                        {selectedTrend.unit}
                      </span>

                    </p>

                  </div>


                  {/* LATEST VALUE */}

                  <div className="bg-white rounded-2xl shadow-sm border p-5">

                    <p className="text-sm text-gray-500">
                      Latest Value
                    </p>

                    <p className="text-2xl font-bold text-blue-600 mt-1">

                      {selectedTrend.latest_value}{" "}

                      <span className="text-sm font-normal">
                        {selectedTrend.unit}
                      </span>

                    </p>

                  </div>


                  {/* CHANGE */}

                  <div className="bg-white rounded-2xl shadow-sm border p-5">

                    <p className="text-sm text-gray-500">
                      Change
                    </p>

                    <div className="flex items-center gap-2 mt-2">

                      {getDirectionIcon(
                        selectedTrend.direction
                      )}

                      <p className="text-2xl font-bold text-gray-800">

                        {selectedTrend.change > 0
                          ? "+"
                          : ""}

                        {selectedTrend.change}

                      </p>

                    </div>

                  </div>


                  {/* PERCENTAGE */}

                  <div className="bg-white rounded-2xl shadow-sm border p-5">

                    <p className="text-sm text-gray-500">
                      Percentage Change
                    </p>

                    <p className="text-2xl font-bold text-gray-800 mt-2">

                      {selectedTrend.percentage_change !==
                      null
                        ? `${
                            selectedTrend.percentage_change >
                            0
                              ? "+"
                              : ""
                          }${selectedTrend.percentage_change}%`
                        : "N/A"}

                    </p>

                  </div>

                </div>


                {/* ==========================================
                    CHART
                =========================================== */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="bg-white rounded-2xl shadow-sm border p-6 mb-8"
                >

                  <div className="flex items-center justify-between mb-6">

                    <div>

                      <h2 className="text-xl font-bold text-gray-800">
                        {selectedTrend.test_name}
                      </h2>

                      <p className="text-sm text-gray-500">
                        Trend over time
                      </p>

                    </div>


                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getStatusClass(
                        selectedTrend.measurements[
                          selectedTrend.measurements.length - 1
                        ]?.status
                      )}`}
                    >

                      <CheckCircle size={17} />

                      <span className="text-sm font-semibold capitalize">

                        {
                          selectedTrend.measurements[
                            selectedTrend.measurements.length - 1
                          ]?.status
                        }

                      </span>

                    </div>

                  </div>


                  <div className="w-full h-[360px]">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <LineChart
                        data={chartData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 10,
                          bottom: 10,
                        }}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis
                          dataKey="date"
                          tick={{
                            fontSize: 12,
                          }}
                        />

                        <YAxis
                          tick={{
                            fontSize: 12,
                          }}
                        />

                        <Tooltip />

                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#2563eb"
                          strokeWidth={3}
                          dot={{
                            r: 5,
                          }}
                          activeDot={{
                            r: 7,
                          }}
                        />


                        {selectedTrend.measurements[0]
                          ?.reference_range && (

                          <>

                            <ReferenceLine
                              y={
                                selectedTrend
                                  .measurements[0]
                                  .reference_range
                                  .low
                              }
                              stroke="#f59e0b"
                              strokeDasharray="5 5"
                              label="Low"
                            />

                            <ReferenceLine
                              y={
                                selectedTrend
                                  .measurements[0]
                                  .reference_range
                                  .high
                              }
                              stroke="#ef4444"
                              strokeDasharray="5 5"
                              label="High"
                            />

                          </>

                        )}

                      </LineChart>

                    </ResponsiveContainer>

                  </div>

                </motion.div>


                {/* ==========================================
                    MEASUREMENT HISTORY
                =========================================== */}

                <div className="bg-white rounded-2xl shadow-sm border p-6">

                  <h2 className="text-xl font-bold text-gray-800 mb-5">
                    Measurement History
                  </h2>

                  <div className="overflow-x-auto">

                    <table className="w-full">

                      <thead>

                        <tr className="border-b text-left">

                          <th className="py-3 px-3 text-sm text-gray-500">
                            Date
                          </th>

                          <th className="py-3 px-3 text-sm text-gray-500">
                            Value
                          </th>

                          <th className="py-3 px-3 text-sm text-gray-500">
                            Status
                          </th>

                          <th className="py-3 px-3 text-sm text-gray-500">
                            Report
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {selectedTrend.measurements.map(
                          (measurement) => (

                            <tr
                              key={
                                measurement.report_id +
                                measurement.date
                              }
                              className="border-b last:border-0"
                            >

                              <td className="py-4 px-3 text-gray-700">

                                {formatDate(
                                  measurement.date
                                )}

                              </td>


                              <td className="py-4 px-3 font-semibold text-gray-800">

                                {measurement.value}{" "}

                                <span className="text-sm font-normal text-gray-500">
                                  {selectedTrend.unit}
                                </span>

                              </td>


                              <td className="py-4 px-3">

                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(
                                    measurement.status
                                  )}`}
                                >
                                  {measurement.status}
                                </span>

                              </td>


                              <td className="py-4 px-3 text-sm text-gray-500">

                                {measurement.filename ||
                                  "Medical Report"}

                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>


                {/* ==================================================
                    GEMINI AI PROGRESS SUMMARY
                =================================================== */}

                <div className="mt-8 bg-white rounded-2xl shadow-sm border p-6">

                  {/* AI HEADER */}

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>

                      <h2 className="text-xl font-bold text-gray-800">
                        ✨ AI Progress Summary
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        Get an AI-generated summary of your
                        longitudinal medical report trends.
                      </p>

                    </div>


                    {/* LANGUAGE BUTTONS */}

                    <div className="flex items-center gap-2">

                      <button
                        onClick={() =>
                          setSummaryLanguage("English")
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                          summaryLanguage === "English"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        English
                      </button>


                      <button
                        onClick={() =>
                          setSummaryLanguage("Tamil")
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                          summaryLanguage === "Tamil"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        தமிழ்
                      </button>

                    </div>

                  </div>


                  {/* GENERATE BUTTON */}

                  <div className="mt-5">

                    <button
                      onClick={generateAISummary}
                      disabled={summaryLoading}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >

                      {summaryLoading ? (

                        <>

                          <RefreshCw
                            size={18}
                            className="animate-spin"
                          />

                          Generating AI Summary...

                        </>

                      ) : (

                        <>
                          ✨ Generate AI Summary
                        </>

                      )}

                    </button>

                  </div>


                  {/* AI ERROR */}

                  {summaryError && (

                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">

                      <div className="flex gap-3">

                        <AlertCircle
                          className="text-red-500 flex-shrink-0"
                          size={20}
                        />

                        <p className="text-sm text-red-700">
                          {summaryError}
                        </p>

                      </div>

                    </div>

                  )}


                  {/* AI LOADING */}

                  {summaryLoading && (

                    <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-5">

                      <div className="flex items-center gap-3">

                        <RefreshCw
                          size={20}
                          className="text-blue-600 animate-spin"
                        />

                        <div>

                          <p className="font-semibold text-blue-800">
                            Gemini is analyzing your reports...
                          </p>

                          <p className="text-sm text-blue-600 mt-1">
                            Comparing your longitudinal
                            medical results.
                          </p>

                        </div>

                      </div>

                    </div>

                  )}


                  {/* AI SUMMARY */}

                  {aiSummary && !summaryLoading && (

                    <div className="mt-6">

                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6">

                        <div className="flex items-center gap-2 mb-4">

                          <div className="p-2 bg-blue-100 rounded-lg">
                            ✨
                          </div>

                          <h3 className="font-bold text-gray-800">
                            Gemini AI Analysis
                          </h3>

                          <span className="ml-auto text-xs font-semibold px-3 py-1 bg-white text-blue-600 rounded-full border">
                            {summaryLanguage}
                          </span>

                        </div>


                        <div className="bg-white rounded-xl p-5 border border-gray-100">

                          <div className="text-sm leading-7 text-gray-700">

  <ReactMarkdown
    components={{

      h1: ({ children }) => (
        <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-4">
          {children}
        </h1>
      ),

      h2: ({ children }) => (
        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
          {children}
        </h2>
      ),

      h3: ({ children }) => (
        <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">
          {children}
        </h3>
      ),

      p: ({ children }) => (
        <p className="mb-4 text-gray-700">
          {children}
        </p>
      ),

      ul: ({ children }) => (
        <ul className="list-disc pl-6 mb-4 space-y-2">
          {children}
        </ul>
      ),

      ol: ({ children }) => (
        <ol className="list-decimal pl-6 mb-4 space-y-2">
          {children}
        </ol>
      ),

      li: ({ children }) => (
        <li className="text-gray-700">
          {children}
        </li>
      ),

      strong: ({ children }) => (
        <strong className="font-bold text-gray-900">
          {children}
        </strong>
      ),

      hr: () => (
        <hr className="my-6 border-gray-200" />
      ),

    }}
  >
    {aiSummary}
  </ReactMarkdown>

</div>

                        </div>

                      </div>

                    </div>

                  )}

                </div>

              </>

            )}

          </>

        )}


        {/* ====================================================
            DISCLAIMER
        ===================================================== */}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">

          <div className="flex gap-3">

            <AlertCircle
              className="text-yellow-600 flex-shrink-0"
              size={22}
            />

            <div>

              <h3 className="font-semibold text-yellow-800">
                Important
              </h3>

              <p className="text-sm text-yellow-700 mt-1">
                This longitudinal comparison is for
                informational purposes only. Always
                verify values against the original
                medical reports and consult a qualified
                healthcare professional for medical
                interpretation.
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}