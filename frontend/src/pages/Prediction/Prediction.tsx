
import { motion } from "framer-motion";

import {
  FaArrowLeft,
  FaRobot,
  FaChartLine,
  FaHeartbeat,
  FaDownload,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import { useLanguage } from "../../context/LanguageContext";

// ============================================================
// TYPES
// ============================================================

type Test = {
  name: string;
  result: number;
  unit: string;
  reference_range?: {
    low?: number | null;
    high?: number | null;
  } | null;
  status: "low" | "high" | "normal" | "unknown";
  confidence?: string;
  raw_line?: string;
};

type ParsedReport = {
  report_type?: string;
  tests?: Test[];
  warnings?: string[];
};

type AnalysisData = {
  parsed_report?: ParsedReport;
  ai_analysis?: string;
};

// ============================================================
// HELPERS
// ============================================================

function getReferenceRange(test: Test): string {
  if (!test.reference_range) {
    return "Not available";
  }

  const { low, high } = test.reference_range;

  if (low == null && high == null) {
    return "Not available";
  }

  if (low == null && high != null) {
    return `< ${high}`;
  }

  if (low != null && high == null) {
    return `> ${low}`;
  }

  return `${low} - ${high}`;
}

function getStatusClass(status: Test["status"]): string {
  switch (status) {
    case "high":
      return "bg-red-100 text-red-700";
    case "low":
      return "bg-yellow-100 text-yellow-700";
    case "normal":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function getStatusLabel(
  status: Test["status"],
  isTamil: boolean
): string {
  switch (status) {
    case "high":
      return isTamil ? "அதிகம்" : "HIGH";
    case "low":
      return isTamil ? "குறைவு" : "LOW";
    case "normal":
      return isTamil ? "இயல்பு" : "NORMAL";
    default:
      return isTamil ? "தெரியவில்லை" : "UNKNOWN";
  }
}

function getOverallStatusLabel(
  status: string,
  isTamil: boolean
): string {
  if (status === "Stable") {
    return isTamil ? "நிலையான நிலை" : "Stable";
  }

  if (status === "Needs Monitoring") {
    return isTamil ? "கண்காணிப்பு தேவை" : "Needs Monitoring";
  }

  return isTamil
    ? "மருத்துவ மதிப்பாய்வு தேவை"
    : "Needs Medical Review";
}

// ============================================================
// INFO CARD
// ============================================================

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-lg">
      <p className="text-sm text-gray-400">{title}</p>
      <h3 className="mt-2 break-words text-xl font-bold text-gray-800">
        {value}
      </h3>
    </div>
  );
}

// ============================================================
// PREDICTION COMPONENT
// ============================================================

function Prediction() {
  const navigate = useNavigate();
  const location = useLocation();

  const { language } = useLanguage();
  const isTamil = language === "Tamil";

  // Supports the report structure passed from Analysis.
  const report = location.state || {};

  const analysis: AnalysisData =
    report.analysis?.parsed_report
      ? report.analysis
      : report.parsed_report
        ? {
            parsed_report: report.parsed_report,
            ai_analysis: report.ai_analysis,
          }
        : {};

  const parsedReport: ParsedReport =
    analysis.parsed_report || {};

  const tests: Test[] = Array.isArray(parsedReport.tests)
    ? parsedReport.tests
    : [];

  const abnormalTests = tests.filter(
    (test) =>
      test.status === "high" || test.status === "low"
  );

  const normalTests = tests.filter(
    (test) => test.status === "normal"
  );

  const unknownTests = tests.filter(
    (test) => test.status === "unknown"
  );

  const abnormalCount = abnormalTests.length;
  const normalCount = normalTests.length;
  const unknownCount = unknownTests.length;

  const overallStatus =
    abnormalCount === 0
      ? "Stable"
      : abnormalCount <= 2
        ? "Needs Monitoring"
        : "Needs Medical Review";

  const importantTests = abnormalTests.slice(0, 6);

  const patientName = String(
    report.patientName || report.patient_name || "Patient"
  );

  const category = String(
    report.category ||
      (report.patient_type === "family" ? "Family" : "Mine")
  );

  const age = String(
    report.age ?? report.patient_age ?? "--"
  );

  const reportType = String(
    parsedReport.report_type ||
      report.reportType ||
      report.report_type ||
      "Medical Report"
  );

  const reportFile = String(
    report.fileName ||
      report.filename ||
      "Medical Report"
  );

  const categoryLabel =
    category.toLowerCase() === "family"
      ? isTamil
        ? "குடும்ப உறுப்பினர்"
        : "Family"
      : isTamil
        ? "எனது அறிக்கை"
        : "Mine";

  // ============================================================
  // DOWNLOAD REPORT
  // ============================================================

  function downloadPredictionReport() {
    const statusLabel = getOverallStatusLabel(
      overallStatus,
      isTamil
    );

    const importantIndicators =
      importantTests.length > 0
        ? importantTests
            .map(
              (test) =>
                `${test.name}: ${test.result} ${test.unit}\n` +
                `${isTamil ? "நிலை" : "Status"}: ${getStatusLabel(test.status, isTamil)}\n` +
                `${isTamil ? "குறிப்பு வரம்பு" : "Reference Range"}: ${getReferenceRange(test)}`
            )
            .join("\n\n")
        : isTamil
          ? "அசாதாரண குறியீடுகள் எதுவும் கண்டறியப்படவில்லை."
          : "No abnormal indicators detected.";

    const reportSummary =
      tests.length > 0
        ? tests
            .map(
              (test) =>
                `${test.name}: ${test.result} ${test.unit}\n` +
                `${isTamil ? "நிலை" : "Status"}: ${getStatusLabel(test.status, isTamil)}\n` +
                `${isTamil ? "குறிப்பு வரம்பு" : "Reference Range"}: ${getReferenceRange(test)}`
            )
            .join("\n\n")
        : isTamil
          ? "பரிசோதனை மதிப்புகள் எதுவும் கிடைக்கவில்லை."
          : "No test values are available.";

    const predictionText =
      abnormalCount === 0
        ? isTamil
          ? "பகுப்பாய்வு செய்யப்பட்ட மதிப்புகள் தற்போது வழங்கப்பட்ட குறிப்பு வரம்புகளுக்குள் உள்ளன. வழக்கமான சுகாதார கண்காணிப்பைத் தொடரவும்."
          : "The analyzed values are currently within their provided reference ranges. Continue routine health monitoring and follow your healthcare provider's advice."
        : isTamil
          ? `இந்த அறிக்கையில் ${abnormalCount} மதிப்புகள் வழங்கப்பட்ட குறிப்பு வரம்புகளுக்கு வெளியே உள்ளன. மருத்துவ வரலாறு மற்றும் அறிகுறிகளுடன் சேர்த்து மருத்துவ நிபுணர் இவற்றை மதிப்பாய்வு செய்ய வேண்டும். இந்த அறிக்கையை மட்டும் வைத்து ஒரு குறிப்பிட்ட நோயைத் தீர்மானிக்க முடியாது.`
          : `This report contains ${abnormalCount} values outside the provided reference ranges. These findings should be reviewed with the patient's medical history and symptoms. This report alone cannot determine a specific medical condition.`;

    const unknownWarning =
      unknownCount > 0
        ? isTamil
          ? `${unknownCount} மதிப்புகளை முழுமையான குறிப்பு வரம்பு இல்லாததால் வகைப்படுத்த முடியவில்லை. அசல் ஆய்வக அறிக்கையுடன் ஒப்பிட்டு சரிபார்க்கவும்.`
          : `${unknownCount} value(s) could not be classified because a complete reference range was unavailable. Verify them against the original laboratory report.`
        : isTamil
          ? "சரிபார்க்கப்படாத மதிப்புகள் எதுவும் இல்லை."
          : "No unverified values were detected.";

    const content = `
============================================================
                         MEDVERSE AI
                   ${isTamil ? "சுகாதார கணிப்பு அறிக்கை" : "PREDICTION REPORT"}
============================================================

${isTamil ? "நோயாளி விவரங்கள்" : "PATIENT INFORMATION"}
------------------------------------------------------------
${isTamil ? "நோயாளி பெயர்" : "Patient Name"} : ${patientName}
${isTamil ? "வகை" : "Category"}          : ${categoryLabel}
${isTamil ? "வயது" : "Age"}               : ${age}
${isTamil ? "அறிக்கை வகை" : "Report Type"} : ${reportType}
${isTamil ? "கோப்பு" : "Report File"}      : ${reportFile}

============================================================
${isTamil ? "தற்போதைய சுகாதார மதிப்பீடு" : "CURRENT HEALTH ASSESSMENT"}
============================================================
${isTamil ? "ஒட்டுமொத்த நிலை" : "Overall Status"} : ${statusLabel}
${isTamil ? "அசாதாரண மதிப்புகள்" : "Abnormal Values"} : ${abnormalCount}
${isTamil ? "இயல்பான மதிப்புகள்" : "Normal Values"}   : ${normalCount}
${isTamil ? "சரிபார்க்கப்படாதவை" : "Unverified"}       : ${unknownCount}

${isTamil ? "இந்த மதிப்பீடு தகவல் நோக்கத்திற்காக மட்டுமே." : "This assessment is informational and does not diagnose a disease."}

============================================================
${isTamil ? "முக்கியமான சுகாதார குறியீடுகள்" : "IMPORTANT HEALTH INDICATORS"}
============================================================
${importantIndicators}

============================================================
${isTamil ? "AI கணிப்பு மற்றும் வழிகாட்டுதல்" : "AI PREDICTION & GUIDANCE"}
============================================================
${predictionText}

============================================================
${isTamil ? "சரிபார்ப்பு எச்சரிக்கை" : "UNVERIFIED VALUE WARNING"}
============================================================
${unknownWarning}

============================================================
${isTamil ? "முழுமையான அறிக்கை சுருக்கம்" : "COMPLETE REPORT SUMMARY"}
============================================================
${reportSummary}

============================================================
${isTamil ? "மருத்துவ மறுப்பு அறிவிப்பு" : "MEDICAL DISCLAIMER"}
============================================================
${
  isTamil
    ? "இந்த அறிக்கை தகவல் நோக்கத்திற்காக மட்டுமே. இது மருத்துவ நோயறிதல் அல்லது சிகிச்சை பரிந்துரை அல்ல. மருத்துவ முடிவுகளுக்கு தகுதியான மருத்துவ நிபுணரை அணுகவும். OCR மூலம் பெறப்பட்ட மதிப்புகளை அசல் அறிக்கையுடன் சரிபார்க்கவும்."
    : "This report is informational only. It is not a medical diagnosis or treatment recommendation. Consult a qualified healthcare professional for medical decisions. Verify OCR-derived values against the original report."
}

============================================================
`;

    const blob = new Blob(["\uFEFF", content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const safePatientName = patientName
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .replace(/\s+/g, "_");

    link.href = url;
    link.download = `MedVerse-AI-Prediction-${safePatientName || "Patient"}.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Navbar />

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft />
            {isTamil ? "பகுப்பாய்விற்குத் திரும்பு" : "Back to Analysis"}
          </button>

          <h1 className="text-3xl font-bold text-blue-700 sm:text-4xl">
            🤖 {isTamil ? "சுகாதார கணிப்பு" : "Health Prediction"}
          </h1>

          <p className="mt-3 text-gray-600">
            {isTamil
              ? "தற்போதைய மருத்துவ அறிக்கை மற்றும் முக்கியமான சுகாதார குறியீடுகளின் அடிப்படையில் AI உதவியுடன் விளக்கம்."
              : "AI-assisted interpretation of the current medical report and important health indicators."}
          </p>
        </motion.div>

        {/* PATIENT INFORMATION */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <InfoCard
            title={isTamil ? "நோயாளி" : "Patient"}
            value={patientName === "Patient" ? (isTamil ? "நீங்கள்" : "You") : patientName}
          />

          <InfoCard
            title={isTamil ? "வகை" : "Category"}
            value={categoryLabel}
          />

          <InfoCard
            title={isTamil ? "வயது" : "Age"}
            value={age}
          />

          <InfoCard
            title={isTamil ? "அறிக்கை வகை" : "Report Type"}
            value={reportType}
          />
        </motion.div>

        {/* CURRENT HEALTH ASSESSMENT */}

        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 rounded-2xl bg-white p-5 shadow-lg sm:p-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <FaHeartbeat className="text-2xl text-blue-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                {isTamil ? "தற்போதைய சுகாதார மதிப்பீடு" : "Current Health Assessment"}
              </h2>
              <p className="text-sm text-gray-500">
                {isTamil
                  ? "இந்த அறிக்கையிலிருந்து பெறப்பட்ட மதிப்புகளின் அடிப்படையில்."
                  : "Based on the values extracted from this report."}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <span
              className={`rounded-full px-4 py-2 font-semibold ${
                overallStatus === "Stable"
                  ? "bg-green-100 text-green-700"
                  : overallStatus === "Needs Monitoring"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {getOverallStatusLabel(overallStatus, isTamil)}
            </span>

            <span className="rounded-full bg-red-50 px-4 py-2 font-semibold text-red-700">
              {abnormalCount} {isTamil ? "அசாதாரணம்" : "Abnormal"}
            </span>

            <span className="rounded-full bg-green-50 px-4 py-2 font-semibold text-green-700">
              {normalCount} {isTamil ? "இயல்பு" : "Normal"}
            </span>

            {unknownCount > 0 && (
              <span className="rounded-full bg-gray-100 px-4 py-2 font-semibold text-gray-600">
                {unknownCount} {isTamil ? "சரிபார்க்கப்படாதது" : "Unverified"}
              </span>
            )}
          </div>

          <p className="mt-6 leading-8 text-gray-600">
            {isTamil
              ? "இந்த மதிப்பீடு தற்போதைய அறிக்கையை மட்டுமே சுருக்கமாகக் காட்டுகிறது. இது எந்த நோயையும் கண்டறியாது மற்றும் தகுதியான மருத்துவ நிபுணரின் மதிப்பீட்டிற்கு மாற்றாகாது."
              : "This assessment summarizes the current report only. It does not diagnose a disease or replace evaluation by a qualified healthcare professional."}
          </p>
        </motion.section>

        {/* IMPORTANT HEALTH INDICATORS */}

        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="flex items-center gap-3">
            <FaChartLine className="text-2xl text-blue-600" />

            <div>
              <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                {isTamil ? "முக்கியமான சுகாதார குறியீடுகள்" : "Important Health Indicators"}
              </h2>
              <p className="mt-1 text-gray-500">
                {isTamil
                  ? "கவனம் அல்லது கண்காணிப்பு தேவைப்படும் மதிப்புகள்."
                  : "Values that may require attention or monitoring."}
              </p>
            </div>
          </div>

          {importantTests.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-6">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-xl text-green-600" />
                <p className="font-semibold text-green-700">
                  {isTamil
                    ? "இந்த அறிக்கையில் அசாதாரண குறியீடுகள் எதுவும் கண்டறியப்படவில்லை."
                    : "No abnormal indicators were detected in this report."}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {importantTests.map((test, index) => (
                <motion.div
                  key={`${test.name}-${index}`}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-2xl bg-white p-6 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {test.name}
                      </h3>
                      <p className="mt-2 text-2xl font-bold text-gray-900">
                        {test.result}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          {test.unit}
                        </span>
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(test.status)}`}
                    >
                      {getStatusLabel(test.status, isTamil)}
                    </span>
                  </div>

                  <div className="mt-5 rounded-xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      {isTamil ? "குறிப்பு வரம்பு" : "Reference Range"}
                    </p>
                    <p className="mt-1 font-semibold text-gray-700">
                      {getReferenceRange(test)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* AI PREDICTION */}

        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 p-5 text-white shadow-xl sm:p-8"
        >
          <div className="flex items-center gap-3">
            <FaRobot className="text-3xl" />
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                {isTamil ? "AI கணிப்பு மற்றும் வழிகாட்டுதல்" : "AI Prediction & Guidance"}
              </h2>
              <p className="mt-1 text-sm text-blue-100">
                {isTamil
                  ? "அறிக்கையின் அடிப்படையிலான சுகாதார வழிகாட்டுதல்"
                  : "Report-based health guidance"}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4 leading-8">
            {abnormalCount === 0 ? (
              <p>
                {isTamil
                  ? "பகுப்பாய்வு செய்யப்பட்ட மதிப்புகள் தற்போது வழங்கப்பட்ட குறிப்பு வரம்புகளுக்குள் உள்ளன. வழக்கமான சுகாதார கண்காணிப்பைத் தொடரவும் மற்றும் உங்கள் மருத்துவ நிபுணரின் பரிந்துரைகளைப் பின்பற்றவும்."
                  : "The analyzed values are currently within their provided reference ranges. Continue routine health monitoring and follow the recommendations of your healthcare provider."}
              </p>
            ) : (
              <>
                <p>
                  {isTamil
                    ? `இந்த அறிக்கையில் வழங்கப்பட்ட குறிப்பு வரம்புகளுக்கு வெளியே ${abnormalCount} மதிப்புகள் உள்ளன. இந்த முடிவுகளை நோயாளியின் மருத்துவ வரலாறு மற்றும் அறிகுறிகளுடன் சேர்த்து மதிப்பாய்வு செய்ய வேண்டும்.`
                    : `This report contains ${abnormalCount} values outside the provided reference ranges. These findings should be reviewed together with the patient's medical history and symptoms.`}
                </p>

                <p>
                  {isTamil
                    ? "இந்த அறிக்கை மட்டும் ஒரு குறிப்பிட்ட மருத்துவ நிலையைத் தீர்மானிக்க முடியாது. மீண்டும் பரிசோதனை அல்லது கூடுதல் பரிசோதனைகள் தேவையா என்பதை மருத்துவ நிபுணர் தீர்மானிக்கலாம்."
                    : "The report alone cannot determine a specific medical condition. A healthcare professional may decide whether repeat testing or additional investigations are appropriate."}
                </p>

                <p>
                  {isTamil
                    ? "இந்த கணிப்பை மட்டும் அடிப்படையாகக் கொண்டு மருந்துகள் அல்லது சப்பிளிமென்ட்களைத் தொடங்கவோ, நிறுத்தவோ அல்லது மாற்றவோ வேண்டாம்."
                    : "Do not start, stop, or change medications or supplements based solely on this prediction."}
                </p>
              </>
            )}

            {unknownCount > 0 && (
              <div className="flex gap-3 rounded-xl bg-white/10 p-4">
                <FaExclamationTriangle className="mt-1 flex-shrink-0" />
                <p>
                  {isTamil
                    ? `${unknownCount} மதிப்புகளை முழுமையான குறிப்பு வரம்பு இல்லாததால் வகைப்படுத்த முடியவில்லை. அசல் ஆய்வக அறிக்கையுடன் ஒப்பிட்டு சரிபார்க்கவும்.`
                    : `${unknownCount} value(s) could not be classified because a complete reference range was unavailable. Verify these values against the original laboratory report.`}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 rounded-xl bg-white/10 p-5">
            <p className="font-semibold">
              {isTamil ? "முக்கியம்:" : "Important:"}
            </p>
            <p className="mt-2 leading-7 text-blue-50">
              {isTamil
                ? "இந்த AI கணிப்பு தகவல் நோக்கத்திற்காக மட்டுமே வழங்கப்படுகிறது. இது மருத்துவ நோயறிதல் அல்லது சிகிச்சை பரிந்துரை அல்ல. மருத்துவ முடிவுகளுக்கு தகுதியான மருத்துவ நிபுணரை அணுகவும்."
                : "This AI prediction is informational only. It is not a medical diagnosis or treatment recommendation. Consult a qualified healthcare professional for medical decisions."}
            </p>
          </div>

          <button
            type="button"
            onClick={downloadPredictionReport}
            className="mt-8 flex items-center gap-3 rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 shadow transition hover:bg-blue-50"
          >
            <FaDownload />
            {isTamil ? "கணிப்பு அறிக்கையைப் பதிவிறக்கவும்" : "Download Prediction Report"}
          </button>
        </motion.section>

        {/* REPORT SUMMARY */}

        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-2xl bg-white p-5 shadow-lg sm:p-8"
        >
          <div className="flex items-center gap-3">
            <FaChartLine className="text-2xl text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                {isTamil ? "அறிக்கை சுருக்கம்" : "Report Summary"}
              </h2>
              <p className="mt-1 text-gray-500">
                {isTamil
                  ? "பிரித்தெடுக்கப்பட்ட அளவீடுகளின் மேலோட்டம்."
                  : "Overview of the extracted measurements."}
              </p>
            </div>
          </div>

          {tests.length === 0 ? (
            <p className="mt-5 text-gray-500">
              {isTamil
                ? "பரிசோதனை மதிப்புகள் எதுவும் கிடைக்கவில்லை."
                : "No test values are available."}
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3">
                      {isTamil ? "பரிசோதனை" : "Test"}
                    </th>
                    <th className="p-3">
                      {isTamil ? "முடிவு" : "Result"}
                    </th>
                    <th className="p-3">
                      {isTamil ? "அலகு" : "Unit"}
                    </th>
                    <th className="p-3">
                      {isTamil ? "நிலை" : "Status"}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tests.map((test, index) => (
                    <tr
                      key={`${test.name}-${index}`}
                      className="border-b"
                    >
                      <td className="p-3 font-semibold">
                        {test.name}
                      </td>
                      <td className="p-3">{test.result}</td>
                      <td className="p-3 text-gray-500">
                        {test.unit}
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(test.status)}`}
                        >
                          {getStatusLabel(test.status, isTamil)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>

        {/* NAVIGATION */}

        <div className="mb-10 mt-10 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-blue-700"
          >
            <FaArrowLeft />
            {isTamil ? "பகுப்பாய்விற்குத் திரும்பு" : "Back to Analysis"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/history")}
            className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-green-700"
          >
            {isTamil ? "வரலாற்றைப் பார்க்கவும்" : "View History"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default Prediction;

