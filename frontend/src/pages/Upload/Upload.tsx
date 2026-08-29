import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FaUpload,
  FaFilePdf,
  FaTimes,
  FaUser,
  FaUsers,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";

function Upload() {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);

  const [category, setCategory] = useState("Mine");

  const [relationship, setRelationship] = useState("");

  const [patientName, setPatientName] = useState("");

  const [age, setAge] = useState("");

  const [reportType, setReportType] = useState("Blood Test");

  function handleFile(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }

  function removeFile() {
    setFile(null);
  }

  async function analyzeReport() {
  if (!file) {
    alert("Please upload a medical report.");
    return;
  }

  try {
    const formData = new FormData();

    formData.append("file", file);

    const response = await axios.post(
      "http://127.0.0.1:8000/reports/upload",
      formData
    );

    console.log("Upload response:", response.data);

    navigate("/analysis", {
      state: {
        category,
        relationship,
        patientName:
          patientName ||
          (category === "Mine"
            ? "You"
            : relationship || "Family Member"),
        age: age || "--",
        reportType,
        fileName: file.name,
        uploadDate: new Date().toLocaleDateString(),

        savedPath: response.data.saved_path,
      },
    });

  } catch (error: any) {
    console.error("Upload error:", error);

    if (error.response) {
      alert(
        error.response.data?.detail ||
        "Unable to upload report"
      );
    } else {
      alert(
        "Cannot connect to MedVerse AI server"
      );
    }
  }
}

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <main className="flex justify-center p-8">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-xl"
        >

          <button
            onClick={() => navigate("/dashboard")}
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft />
            Dashboard
          </button>

          <h2 className="text-3xl font-bold text-gray-800">
            Upload Medical Report
          </h2>

          <p className="mt-2 text-gray-500">
            Upload a report for yourself or one of your family members.
          </p>

          {/* Patient Category */}

          <div className="mt-8">

            <h3 className="mb-4 text-lg font-semibold">
              Patient Category
            </h3>

            <div className="grid grid-cols-2 gap-4">

              <button
                onClick={() => setCategory("Mine")}
                className={`rounded-xl border p-4 transition ${
                  category === "Mine"
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
              >
                <FaUser className="mx-auto mb-2 text-2xl" />
                Mine
              </button>

              <button
                onClick={() => setCategory("Family")}
                className={`rounded-xl border p-4 transition ${
                  category === "Family"
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
              >
                <FaUsers className="mx-auto mb-2 text-2xl" />
                Family Member
              </button>

            </div>

          </div>

          {/* Family */}

          {category === "Family" && (

            <div className="mt-8">

              <label className="font-semibold">
                Relationship
              </label>

              <select
                value={relationship}
                onChange={(e) =>
                  setRelationship(e.target.value)
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">Select Relationship</option>
                <option>Father</option>
                <option>Mother</option>
                <option>Brother</option>
                <option>Sister</option>
                <option>Spouse</option>
                <option>Son</option>
                <option>Daughter</option>
                <option>Grandparent</option>
                <option>Other</option>
              </select>

            </div>

          )}

          {/* Patient Details */}

          <div className="mt-8 grid md:grid-cols-2 gap-6">

            <div>

              <label className="font-semibold">
                Patient Name
              </label>

              <input
                value={patientName}
                onChange={(e) =>
                  setPatientName(e.target.value)
                }
                placeholder={
                  category === "Mine"
                    ? "Your Name"
                    : "Enter Patient Name"
                }
                className="mt-2 w-full rounded-xl border p-3"
              />

            </div>

            <div>

              <label className="font-semibold">
                Age
              </label>

              <input
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Example: 45 Years"
                className="mt-2 w-full rounded-xl border p-3"
              />

            </div>

          </div>

          {/* Report */}

          <div className="mt-8">

            <label className="font-semibold">
              Report Type
            </label>

            <select
              value={reportType}
              onChange={(e) =>
                setReportType(e.target.value)
              }
              className="mt-2 w-full rounded-xl border p-3"
            >
              <option>Blood Test</option>
              <option>Complete Blood Count (CBC)</option>
              <option>Diabetes Report</option>
              <option>Heart Health</option>
              <option>Kidney Function Test</option>
              <option>Liver Function Test</option>
              <option>Thyroid Test</option>
              <option>Urine Analysis</option>
              <option>ECG</option>
              <option>X-Ray</option>
              <option>MRI Scan</option>
              <option>CT Scan</option>
              <option>Other</option>
            </select>

          </div>

          {/* Upload */}

          {!file ? (

            <label className="mt-8 block cursor-pointer rounded-2xl border-2 border-dashed border-blue-400 p-10 text-center hover:bg-blue-50">

              <FaUpload
                className="mx-auto text-blue-600"
                size={45}
              />

              <p className="mt-4 font-semibold">
                Click to Upload Medical Report
              </p>

              <p className="text-gray-500">
                PDF • JPG • PNG
              </p>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFile}
                className="hidden"
              />

            </label>

          ) : (

            <div className="mt-8 flex items-center justify-between rounded-2xl bg-blue-50 p-5">

              <div className="flex items-center gap-3">

                <FaFilePdf
                  className="text-red-500"
                  size={24}
                />

                <div>

                  <p className="font-semibold">
                    {file.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    Ready for AI Analysis
                  </p>

                </div>

              </div>

              <button
                onClick={removeFile}
                className="text-red-500"
              >
                <FaTimes size={18} />
              </button>

            </div>

          )}

          <button
            onClick={analyzeReport}
            className="mt-8 w-full rounded-2xl bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
          >
            Analyze Report with MedVerse AI
          </button>

        </motion.div>

      </main>

    </div>
  );
}

export default Upload;