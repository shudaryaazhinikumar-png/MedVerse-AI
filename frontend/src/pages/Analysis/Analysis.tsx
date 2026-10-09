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



import type { ReactNode } from "react";



import ReactMarkdown from "react-markdown";



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



  confidence: string;



  raw_line?: string;

};





type ParsedReport = {

  report_type?: string;

  tests?: Test[];

  warnings?: string[];

};





type AnalysisData = {

  filename?: string;

  raw_text?: string;

  cleaned_text?: string;

  parsed_report?: ParsedReport;

  ai_analysis?: string;

};





// ============================================================

// REFERENCE RANGE

// ============================================================



function getReferenceRange(test: Test): string {

  if (!test.reference_range) {

    return "Not available";

  }



  const low = test.reference_range.low;

  const high = test.reference_range.high;



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





// ============================================================

// STATUS COLOR

// ============================================================



function getStatusClass(status: Test["status"]): string {

  switch (status) {

    case "high":

      return "bg-red-100 text-red-700";



    case "low":

      return "bg-yellow-100 text-yellow-700";



    case "normal":

      return "bg-green-100 text-green-700";



    case "unknown":

    default:

      return "bg-gray-100 text-gray-600";

  }

}





// ============================================================

// STATUS LABEL

// ============================================================



function getStatusLabel(

  status: Test["status"],

  isTamil: boolean

): string {

  if (isTamil) {

    switch (status) {

      case "high":

        return "அதிகம்";



      case "low":

        return "குறைவு";



      case "normal":

        return "இயல்பானது";



      case "unknown":

      default:

        return "தெரியவில்லை";

    }

  }



  switch (status) {

    case "high":

      return "HIGH";



    case "low":

      return "LOW";



    case "normal":

      return "NORMAL";



    case "unknown":

    default:

      return "UNKNOWN";

  }

}





// ============================================================

// AI TEXT CLEANER

// ============================================================



function cleanAiText(text: string): string {
  return text.trim();
}





// ============================================================

// ANALYSIS PAGE

// ============================================================



function Analysis() {

  const navigate = useNavigate();

  const location = useLocation();



  // GLOBAL LANGUAGE

  const { language } = useLanguage();



  const isTamil = language === "Tamil";





  // ----------------------------------------------------------

  // REPORT DATA

  // ----------------------------------------------------------



  const report = location.state || {};



  const analysis: AnalysisData = report.analysis || {};



  const parsedReport: ParsedReport =

    analysis.parsed_report || {};



  const tests: Test[] = Array.isArray(parsedReport.tests)

    ? parsedReport.tests

    : [];





  // ----------------------------------------------------------

  // AI TEXT

  // ----------------------------------------------------------



  const aiText = analysis.ai_analysis

    ? cleanAiText(analysis.ai_analysis)

    : "";





  // ----------------------------------------------------------

  // TEST GROUPS

  // ----------------------------------------------------------



  const abnormalTests = tests.filter(

    (test) =>

      test.status === "high" ||

      test.status === "low"

  );



  const normalTests = tests.filter(

    (test) => test.status === "normal"

  );



  const unknownTests = tests.filter(

    (test) => test.status === "unknown"

  );





  // ----------------------------------------------------------

  // HEALTH STATUS

  // ----------------------------------------------------------



  const healthStatus =

    abnormalTests.length === 0

      ? "Healthy"

      : abnormalTests.length <= 2

      ? "Needs Monitoring"

      : "Needs Medical Review";





  const healthStatusLabel = isTamil

    ? healthStatus === "Healthy"

      ? "ஆரோக்கியமாக உள்ளது"

      : healthStatus === "Needs Monitoring"

      ? "கண்காணிப்பு தேவை"

      : "மருத்துவ பரிசோதனை தேவை"

    : healthStatus;



  function downloadAnalysis() {
  const patientName = String(
    report.patientName || "You"
  );

  const age = String(
    report.age || "--"
  );

  const reportType = String(
    parsedReport.report_type ||
      report.reportType ||
      (isTamil ? "மருத்துவ அறிக்கை" : "Medical Report")
  );

  const fileName = String(
    report.fileName ||
      analysis.filename ||
      "medical-report"
  );

  const uploadDate = String(
    report.uploadDate ||
      new Date().toLocaleDateString()
  );

  const title = isTamil
    ? "மருத்துவ அறிக்கை பகுப்பாய்வு"
    : "Medical Report Analysis";

  const patientLabel = isTamil ? "நோயாளி பெயர்" : "Patient Name";
  const ageLabel = isTamil ? "வயது" : "Age";
  const reportTypeLabel = isTamil ? "அறிக்கை வகை" : "Report Type";
  const fileLabel = isTamil ? "அறிக்கை கோப்பு" : "Report File";
  const dateLabel = isTamil ? "பகுப்பாய்வு தேதி" : "Analysis Date";

  const healthTitle = isTamil
    ? "உடல்நிலை"
    : "HEALTH STATUS";

  const testsTitle = isTamil
    ? "கண்டறியப்பட்ட பரிசோதனை மதிப்புகள்"
    : "DETECTED TEST VALUES";

  const abnormalTitle = isTamil
    ? "அசாதாரண முடிவுகள்"
    : "ABNORMAL FINDINGS";

  const normalTitle = isTamil
    ? "இயல்பான முடிவுகள்"
    : "NORMAL FINDINGS";

  const aiTitle = isTamil
    ? "AI பகுப்பாய்வு"
    : "GEMINI AI ANALYSIS";

  const warningTitle = isTamil
    ? "எச்சரிக்கைகள்"
    : "WARNINGS";

  const disclaimerTitle = isTamil
    ? "மருத்துவ மறுப்பு"
    : "MEDICAL DISCLAIMER";

  const noAbnormal = isTamil
    ? "அசாதாரண மதிப்புகள் எதுவும் கண்டறியப்படவில்லை."
    : "No abnormal findings detected.";

  const noNormal = isTamil
    ? "இயல்பான மதிப்புகள் எதுவும் பெறப்படவில்லை."
    : "No normal findings available.";

  const noWarnings = isTamil
    ? "கூடுதல் எச்சரிக்கைகள் இல்லை."
    : "No additional warnings.";

  const testResults = tests.length > 0
    ? tests
        .map((test) => {
          const referenceRange = getReferenceRange(test);

          return `${test.name}: ${test.result} ${test.unit}
${isTamil ? "குறிப்பு வரம்பு" : "Reference Range"}: ${referenceRange}
${isTamil ? "நிலை" : "Status"}: ${getStatusLabel(test.status, isTamil)}`;
        })
        .join("\n\n")
    : (
        isTamil
          ? "நம்பகமான பரிசோதனை மதிப்புகள் எதுவும் பெறப்படவில்லை."
          : "No reliable test values were extracted."
      );

  const abnormalResults = abnormalTests.length > 0
    ? abnormalTests
        .map(
          (test) =>
            `${test.name}: ${test.result} ${test.unit}
${isTamil ? "நிலை" : "Status"}: ${getStatusLabel(test.status, isTamil)}
${isTamil ? "குறிப்பு" : "Reference"}: ${getReferenceRange(test)}`
        )
        .join("\n\n")
    : noAbnormal;

  const normalResults = normalTests.length > 0
    ? normalTests
        .map(
          (test) =>
            `${test.name}: ${test.result} ${test.unit}
${isTamil ? "குறிப்பு" : "Reference"}: ${getReferenceRange(test)}`
        )
        .join("\n\n")
    : noNormal;

  const warnings = parsedReport.warnings &&
    parsedReport.warnings.length > 0
    ? parsedReport.warnings
        .map((warning) => `- ${warning}`)
        .join("\n")
    : noWarnings;

  const disclaimer = isTamil
    ? "இந்த அறிக்கை MedVerse AI மூலம் தகவல் மற்றும் கல்வி நோக்கங்களுக்காக உருவாக்கப்பட்டுள்ளது. இது மருத்துவ நோயறிதல் அல்ல. OCR மூலம் பெறப்பட்ட மதிப்புகளை அசல் மருத்துவ அறிக்கையுடன் சரிபார்த்து, மருத்துவ ஆலோசனைக்காக தகுதியான சுகாதார நிபுணரை அணுகவும்."
    : "This analysis is generated by MedVerse AI for informational and educational purposes only. It is not a medical diagnosis. OCR-derived values should be verified against the original medical report. Consult a qualified healthcare professional for medical advice.";

  const content = `============================================================
                    MEDVERSE AI
              ${title}
============================================================

${patientLabel}: ${patientName}
${ageLabel}: ${age}
${reportTypeLabel}: ${reportType}
${fileLabel}: ${fileName}
${dateLabel}: ${uploadDate}

============================================================
${healthTitle}
============================================================

${healthStatusLabel}

============================================================
${testsTitle}
============================================================

${testResults}

============================================================
${abnormalTitle}
============================================================

${abnormalResults}

============================================================
${normalTitle}
============================================================

${normalResults}

============================================================
${aiTitle}
============================================================

${aiText || (
  isTamil
    ? "AI பகுப்பாய்வு கிடைக்கவில்லை."
    : "AI analysis is not available."
)}

============================================================
${warningTitle}
============================================================

${warnings}

============================================================
${disclaimerTitle}
============================================================

${disclaimer}

============================================================
                    END OF REPORT
============================================================
`;

  const blob = new Blob(
    [content],
    {
      type: "text/plain;charset=utf-8",
    }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  const safePatientName = patientName
    .replace(/[^a-zA-Z0-9_-]/g, "_");

  link.download =
    `MedVerse-AI-${safePatientName}-Analysis.txt`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}


  // UI

  // ==========================================================



  return (

    <div className="min-h-screen bg-gray-100">



      <Navbar />



      <main className="max-w-6xl mx-auto p-8">





        {/* ================================================== */}

        {/* SUCCESS BANNER */}

        {/* ================================================== */}



        <motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          className="bg-green-100 border border-green-300 rounded-2xl p-6 flex items-center gap-4"

        >



          <div className="flex-shrink-0">



            <FaCheckCircle

              size={35}

              className="text-green-600"

            />



          </div>





          <div>



            <h2 className="text-2xl font-bold text-green-700">



              {isTamil

                ? "பகுப்பாய்வு வெற்றிகரமாக முடிந்தது"

                : "Analysis Completed Successfully"}



            </h2>





            <p className="text-gray-600">



              {isTamil

                ? "AI பகுப்பாய்வு முடிந்தது • அறிக்கை வெற்றிகரமாக செயலாக்கப்பட்டது"

                : "AI analysis completed • Report processed successfully"}



            </p>



          </div>



        </motion.div>





        {/* ================================================== */}

        {/* TITLE */}

        {/* ================================================== */}



        <div className="mt-8">



          <h1 className="text-4xl font-bold text-gray-800">



            {isTamil

              ? "மருத்துவ அறிக்கை பகுப்பாய்வு"

              : "Medical Report Analysis"}



          </h1>





          <p className="text-gray-500 mt-2">



            {isTamil

              ? "AI மூலம் உருவாக்கப்பட்ட மருத்துவ விளக்கம் மற்றும் பரிந்துரைகள்."

              : "AI-generated medical interpretation and recommendations."}



          </p>



        </div>





        {/* ================================================== */}

        {/* PATIENT INFORMATION */}

        {/* ================================================== */}



        <div className="grid md:grid-cols-3 gap-6 mt-8">



          <InfoCard

            title={isTamil ? "நோயாளி" : "Patient"}

            value={String(report.patientName || "You")}

          />





          <InfoCard

            title={isTamil ? "வகை" : "Category"}

            value={

              report.category === "Family"

                ? isTamil

                  ? "குடும்பம்"

                  : "Family"

                : isTamil

                ? "நான்"

                : "Mine"

            }

          />





          <InfoCard

            title={isTamil ? "வயது" : "Age"}

            value={String(report.age || "--")}

          />





          <InfoCard

            title={isTamil ? "அறிக்கை வகை" : "Report Type"}

            value={

              parsedReport.report_type ||

              report.reportType ||

              (isTamil

                ? "மருத்துவ அறிக்கை"

                : "Medical Report")

            }

          />





          <InfoCard

            title={isTamil ? "பதிவேற்ற தேதி" : "Upload Date"}

            value={

              report.uploadDate ||

              new Date().toLocaleDateString()

            }

          />





          <InfoCard

            title={isTamil ? "பதிவேற்றப்பட்ட கோப்பு" : "Uploaded File"}

            value={String(report.fileName || "--")}

          />



        </div>





        {/* ================================================== */}

        {/* HEALTH STATUS */}

        {/* ================================================== */}



        <div className="bg-white rounded-2xl shadow p-6 mt-8">



          <h2 className="text-xl font-bold text-gray-800">



            {isTamil

              ? "உடல்நிலை"

              : "Health Status"}



          </h2>





          <div className="mt-5">



            <span

              className={`px-4 py-2 rounded-full font-semibold ${

                healthStatus === "Healthy"

                  ? "bg-green-100 text-green-700"

                  : healthStatus === "Needs Monitoring"

                  ? "bg-yellow-100 text-yellow-700"

                  : "bg-red-100 text-red-700"

              }`}

            >



              {healthStatusLabel}



            </span>



          </div>





          <p className="mt-5 text-gray-500">



            {isTamil

              ? "இந்த நிலை மருத்துவ அறிக்கையிலிருந்து பெறப்பட்ட பரிசோதனை மதிப்புகளை அடிப்படையாகக் கொண்டது. இது மருத்துவ நோயறிதல் அல்ல."

              : "Status is based on the test values extracted from the medical report. This is not a medical diagnosis."}



          </p>



        </div>





        {/* ================================================== */}

        {/* DETECTED TEST VALUES */}

        {/* ================================================== */}



        <div className="bg-white rounded-2xl shadow p-6 mt-8">



          <h2 className="text-xl font-bold text-gray-800">



            {isTamil

              ? "கண்டறியப்பட்ட பரிசோதனை மதிப்புகள்"

              : "Detected Test Values"}



          </h2>





          <p className="text-gray-500 mt-2">



            {isTamil

              ? "பதிவேற்றப்பட்ட மருத்துவ அறிக்கையிலிருந்து பெறப்பட்ட மதிப்புகள்."

              : "Values extracted from the uploaded medical report."}



          </p>





          {tests.length === 0 ? (



            <p className="mt-5 text-gray-500">



              {isTamil

                ? "இந்த அறிக்கையிலிருந்து நம்பகமான பரிசோதனை மதிப்புகள் எதுவும் பெறப்படவில்லை."

                : "No reliable test values were extracted from this report."}



            </p>



          ) : (



            <div className="overflow-x-auto mt-5">



              <table className="w-full text-left border-collapse">



                <thead>



                  <tr className="border-b bg-gray-50">



                    <th className="p-3 text-gray-700">



                      {isTamil ? "பரிசோதனை" : "Test"}



                    </th>





                    <th className="p-3 text-gray-700">



                      {isTamil ? "முடிவு" : "Result"}



                    </th>





                    <th className="p-3 text-gray-700">



                      {isTamil ? "அலகு" : "Unit"}



                    </th>





                    <th className="p-3 text-gray-700">



                      {isTamil

                        ? "குறிப்பு வரம்பு"

                        : "Reference Range"}



                    </th>





                    <th className="p-3 text-gray-700">



                      {isTamil ? "நிலை" : "Status"}



                    </th>



                  </tr>



                </thead>





                <tbody>



                  {tests.map((test, index) => (



                    <tr

                      key={`${test.name}-${index}`}

                      className="border-b hover:bg-gray-50 transition"

                    >



                      <td className="p-3 font-semibold text-gray-800">

                        {test.name}

                      </td>





                      <td className="p-3 text-gray-700">

                        {test.result}

                      </td>





                      <td className="p-3 text-gray-600">

                        {test.unit}

                      </td>





                      <td className="p-3 text-gray-600">



                        {getReferenceRange(test) === "Not available"

                          ? isTamil

                            ? "கிடைக்கவில்லை"

                            : "Not available"

                          : getReferenceRange(test)}



                      </td>





                      <td className="p-3">



                        <span

                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(

                            test.status

                          )}`}

                        >



                          {getStatusLabel(

                            test.status,

                            isTamil

                          )}



                        </span>



                      </td>



                    </tr>



                  ))}



                </tbody>



              </table>



            </div>



          )}



        </div>





        {/* ================================================== */}

        {/* ABNORMAL FINDINGS */}

        {/* ================================================== */}



        <div className="bg-white rounded-2xl shadow p-6 mt-8">



          <h2 className="text-xl font-bold text-gray-800">



            {isTamil

              ? "அசாதாரண முடிவுகள்"

              : "Abnormal Findings"}



          </h2>





          <p className="text-gray-500 mt-2">



            {isTamil

              ? "கொடுக்கப்பட்ட குறிப்பு வரம்புகளுக்கு வெளியே உள்ள பரிசோதனை மதிப்புகள்."

              : "Test values outside the provided reference ranges."}



          </p>





          {abnormalTests.length === 0 ? (



            <p className="mt-5 text-green-600 font-semibold">



              {isTamil

                ? "அசாதாரண மதிப்புகள் எதுவும் கண்டறியப்படவில்லை."

                : "No abnormal values were detected."}



            </p>



          ) : (



            <div className="mt-5 space-y-3">



              {abnormalTests.map((test, index) => (



                <div

                  key={`${test.name}-${index}`}

                  className="rounded-xl bg-red-50 border border-red-100 p-4"

                >



                  <div className="flex items-center justify-between gap-4">



                    <p className="font-semibold text-gray-800">

                      {test.name}

                    </p>





                    <span

                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(

                        test.status

                      )}`}

                    >



                      {getStatusLabel(

                        test.status,

                        isTamil

                      )}



                    </span>



                  </div>





                  <p className="text-gray-600 mt-2">



                    {isTamil ? "முடிவு" : "Result"}:{" "}

                    {test.result} {test.unit}



                  </p>





                  <p className="text-gray-600 mt-1">



                    {isTamil

                      ? "குறிப்பு"

                      : "Reference"}:{" "}



                    {getReferenceRange(test) === "Not available"

                      ? isTamil

                        ? "கிடைக்கவில்லை"

                        : "Not available"

                      : getReferenceRange(test)}



                  </p>



                </div>



              ))}



            </div>



          )}



        </div>





        {/* ================================================== */}

        {/* NORMAL FINDINGS */}

        {/* ================================================== */}



        <div className="bg-white rounded-2xl shadow p-6 mt-8">



          <h2 className="text-xl font-bold text-gray-800">



            {isTamil

              ? "இயல்பான முடிவுகள்"

              : "Normal Findings"}



          </h2>





          <p className="text-gray-500 mt-2">



            {isTamil

              ? "கொடுக்கப்பட்ட குறிப்பு வரம்புகளுக்குள் உள்ள பரிசோதனை மதிப்புகள்."

              : "Test values within the provided reference ranges."}



          </p>





          {normalTests.length === 0 ? (



            <p className="mt-5 text-gray-500">



              {isTamil

                ? "இயல்பான பரிசோதனை மதிப்புகள் எதுவும் பெறப்படவில்லை."

                : "No normal test values were extracted."}



            </p>



          ) : (



            <div className="grid md:grid-cols-2 gap-4 mt-5">



              {normalTests.map((test, index) => (



                <div

                  key={`${test.name}-${index}`}

                  className="bg-green-50 border border-green-100 rounded-xl p-4"

                >



                  <p className="font-semibold text-gray-800">



                    ✓ {test.name}



                  </p>





                  <p className="text-gray-600 mt-1">



                    {test.result} {test.unit}



                  </p>





                  <p className="text-sm text-gray-500 mt-1">



                    {isTamil

                      ? "குறிப்பு"

                      : "Reference"}:{" "}



                    {getReferenceRange(test) === "Not available"

                      ? isTamil

                        ? "கிடைக்கவில்லை"

                        : "Not available"

                      : getReferenceRange(test)}



                  </p>



                </div>



              ))}



            </div>



          )}



        </div>





        {/* ================================================== */}

        {/* UNKNOWN / UNVERIFIED FINDINGS */}

        {/* ================================================== */}



        {unknownTests.length > 0 && (



          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-8">



            <h2 className="text-xl font-bold text-gray-800">



              {isTamil

                ? "சரிபார்க்க வேண்டிய மதிப்புகள்"

                : "Values Requiring Verification"}



            </h2>





            <p className="text-gray-500 mt-2">



              {isTamil

                ? "முழுமையான குறிப்பு வரம்பு கிடைக்காததால் இந்த மதிப்புகளை நம்பகமாக வகைப்படுத்த முடியவில்லை."

                : "These values could not be classified reliably because a complete reference range was not available."}



            </p>





            <div className="mt-5 space-y-3">



              {unknownTests.map((test, index) => (



                <div

                  key={`${test.name}-${index}`}

                  className="bg-white border border-gray-200 rounded-xl p-4"

                >



                  <div className="flex items-center justify-between gap-4">



                    <p className="font-semibold text-gray-800">

                      {test.name}

                    </p>





                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-600">



                      {isTamil

                        ? "சரிபார்க்கவும்"

                        : "UNKNOWN"}



                    </span>



                  </div>





                  <p className="text-gray-600 mt-2">



                    {isTamil ? "முடிவு" : "Result"}:{" "}

                    {test.result} {test.unit}



                  </p>





                  <p className="text-gray-500 mt-1">



                    {isTamil

                      ? "குறிப்பு: கிடைக்கவில்லை"

                      : "Reference: Not available"}



                  </p>



                </div>



              ))}



            </div>



          </div>



        )}





        {/* ================================================== */}

        {/* GEMINI AI ANALYSIS */}

        {/* ================================================== */}



        <div className="bg-white rounded-2xl shadow p-6 mt-8">



          <div className="flex items-center gap-3 border-b pb-4">



            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100">



              <FaRobot className="text-blue-600 text-xl" />



            </div>





            <div>



              <h2 className="text-xl font-bold text-gray-800">



                {isTamil

                  ? "AI பகுப்பாய்வு"

                  : "AI Analysis"}



              </h2>





              <p className="text-sm text-gray-500">



                {isTamil

                  ? "பெறப்பட்ட மருத்துவ அறிக்கை தரவின் அடிப்படையில் Gemini உருவாக்கிய விளக்கம்."

                  : "Gemini-generated interpretation of the extracted report data."}



              </p>



            </div>



          </div>





          {aiText ? (



            <div className="mt-6 text-gray-700 leading-8">



              <ReactMarkdown

                components={{



                  h1: ({ children }) => (

                    <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-3">

                      {children}

                    </h1>

                  ),



                  h2: ({ children }) => (

                    <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">

                      {children}

                    </h2>

                  ),



                  h3: ({ children }) => (

                    <h3 className="text-lg font-bold text-gray-800 mt-5 mb-2">

                      {children}

                    </h3>

                  ),



                  p: ({ children }) => (

                    <p className="mb-4 text-gray-700">

                      {children}

                    </p>

                  ),



                  ul: ({ children }) => (

                    <ul className="list-disc pl-6 mb-5 space-y-2">

                      {children}

                    </ul>

                  ),



                  ol: ({ children }) => (

                    <ol className="list-decimal pl-6 mb-5 space-y-2">

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



                  blockquote: ({ children }) => (

                    <blockquote className="border-l-4 border-blue-400 bg-blue-50 px-4 py-3 my-5 rounded-r-lg">

                      {children}

                    </blockquote>

                  ),



                  code: ({ children }) => (

                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">

                      {children}

                    </code>

                  ),



                }}

              >



                {aiText}



              </ReactMarkdown>



            </div>



          ) : (



            <div className="mt-6 bg-gray-50 rounded-xl p-5">



              <p className="text-gray-500">



                {isTamil

                  ? "AI பகுப்பாய்வு கிடைக்கவில்லை."

                  : "AI analysis is not available."}



              </p>



            </div>



          )}



        </div>





        {/* ================================================== */}

        {/* OCR WARNINGS */}

        {/* ================================================== */}



        {parsedReport.warnings &&

          parsedReport.warnings.length > 0 && (



            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-8">



              <div className="flex items-center gap-3">



                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">



                  <span className="text-yellow-700 text-xl">

                    ⚠

                  </span>



                </div>





                <div>



                  <h2 className="text-xl font-bold text-yellow-800">



                    {isTamil

                      ? "எச்சரிக்கைகள்"

                      : "Warnings"}



                  </h2>





                  <p className="text-yellow-700 text-sm mt-1">



                    {isTamil

                      ? "பெறப்பட்ட தகவல்களை அசல் அறிக்கையுடன் சரிபார்க்கவும்."

                      : "Please verify extracted information against the original report."}



                  </p>



                </div>



              </div>





              <ul className="mt-5 space-y-3">



                {parsedReport.warnings.map(

                  (warning: string, index: number) => (



                    <li

                      key={index}

                      className="bg-white border border-yellow-200 rounded-xl p-4 text-yellow-800"

                    >



                      ⚠ {warning}



                    </li>



                  )

                )}



              </ul>



            </div>



          )}





        {/* ================================================== */}

        {/* QUICK ACTIONS */}

        {/* ================================================== */}



        <div className="grid md:grid-cols-4 gap-5 mt-10">



          <ActionCard

            icon={<FaComments />}

            title={isTamil ? "AI உரையாடல்" : "AI Chat"}

            color="bg-blue-600"

            onClick={() =>

              navigate("/chat", {

                state: report,

              })

            }

          />





          <ActionCard

            icon={<FaChartLine />}

            title={isTamil ? "கணிப்பு" : "Prediction"}

            color="bg-purple-600"

            onClick={() =>

              navigate("/prediction", {

                state: report,

              })

            }

          />





          <ActionCard

            icon={<FaHistory />}

            title={isTamil ? "வரலாறு" : "History"}

            color="bg-green-600"

            onClick={() =>

              navigate("/history")

            }

          />





          <ActionCard
            icon={<FaDownload />}
            title={isTamil ? "பதிவிறக்கம்" : "Download"}
            color="bg-orange-600"
            onClick={downloadAnalysis}
          />



        </div>





        {/* ================================================== */}

        {/* BACK */}

        {/* ================================================== */}



        <button

          onClick={() =>

            navigate("/dashboard")

          }

          className="mt-10 mb-10 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"

        >



          <FaArrowLeft />



          {isTamil

            ? "டாஷ்போர்டுக்குத் திரும்பு"

            : "Back to Dashboard"}



        </button>



      </main>



    </div>

  );

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



    <div className="bg-white rounded-2xl shadow p-5">



      <p className="text-gray-400 text-sm">

        {title}

      </p>





      <h3 className="text-xl font-bold mt-2 break-words text-gray-800">

        {value}

      </h3>



    </div>



  );

}





// ============================================================

// ACTION CARD

// ============================================================



function ActionCard({

  icon,

  title,

  color,

  onClick,

}: {

  icon: ReactNode;

  title: string;

  color: string;

  onClick: () => void;

}) {



  return (



    <button

      onClick={onClick}

      className={`${color} rounded-2xl text-white p-6 shadow hover:scale-105 transition flex flex-col items-center justify-center`}

    >



      <div className="text-3xl flex items-center justify-center">

        {icon}

      </div>





      <h3 className="mt-3 font-bold">

        {title}

      </h3>



    </button>



  );

}





export default Analysis;