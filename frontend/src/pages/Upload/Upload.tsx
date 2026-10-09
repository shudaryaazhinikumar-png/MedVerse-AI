import { useEffect, useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import axios from "axios";

import {
  FaUpload,
  FaFilePdf,
  FaTimes,
  FaUser,
  FaUsers,
  FaArrowLeft,
  FaUserPlus,
} from "react-icons/fa";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import { useLanguage } from "../../context/LanguageContext";

interface FamilyMember {
  _id?: string;
  id?: string;
  member_id?: string;
  name: string;
  relationship: string;
  age: number;
}

type Language = "English" | "Tamil";

function Upload() {
  const navigate = useNavigate();
  const location= useLocation();
  const API_URL = "http://127.0.0.1:8000";

  // ============================================================
  // GLOBAL LANGUAGE
  // ============================================================

  const { language } = useLanguage();
  const isTamil = language === "Tamil";

  // ============================================================
  // BASIC STATES
  // ============================================================

  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("Mine");

  // ============================================================
  // FAMILY MEMBERS
  // ============================================================

  const [familyMembers, setFamilyMembers] =
    useState<FamilyMember[]>([]);

  const [selectedFamilyMemberId, setSelectedFamilyMemberId] =
    useState("");

  const [familyLoading, setFamilyLoading] =
    useState(false);

  const [familyError, setFamilyError] =
    useState("");

  // ============================================================
  // PATIENT DETAILS
  // ============================================================

  const [patientName, setPatientName] =
    useState("");

  const [relationship, setRelationship] =
    useState("");

  const [age, setAge] =
    useState("");

  const [reportType, setReportType] =
    useState("Blood Test");

  // ============================================================
  // ADD FAMILY MEMBER
  // ============================================================

  const [showAddFamilyForm, setShowAddFamilyForm] =
    useState(false);

  const [newMemberName, setNewMemberName] =
    useState("");

  const [newMemberRelationship, setNewMemberRelationship] =
    useState("Sister");

  const [newMemberAge, setNewMemberAge] =
    useState("");

  const [addingMember, setAddingMember] =
    useState(false);

  // ============================================================
  // ANALYSIS
  // ============================================================

  const [loading, setLoading] =
    useState(false);

  // ============================================================
  // TRANSLATIONS
  // ============================================================

  const t = {
    back:
      isTamil
        ? "டாஷ்போர்டுக்குத் திரும்பு"
        : "Back to Dashboard",

    title:
      isTamil
        ? "மருத்துவ அறிக்கையை பதிவேற்றவும்"
        : "Upload Medical Report",

    subtitle:
      isTamil
        ? "உங்கள் மருத்துவ அறிக்கை அல்லது குடும்ப உறுப்பினரின் அறிக்கையை MedVerse AI மூலம் பகுப்பாய்வு செய்யுங்கள்."
        : "Analyze your medical report or a family member's report with MedVerse AI.",

    patientCategory:
      isTamil
        ? "நோயாளி வகையைத் தேர்ந்தெடுக்கவும்"
        : "Select Patient Category",

    myReport:
      isTamil
        ? "எனது அறிக்கை"
        : "My Report",

    familyReport:
      isTamil
        ? "குடும்ப உறுப்பினர் அறிக்கை"
        : "Family Report",

    selectFamilyMember:
      isTamil
        ? "குடும்ப உறுப்பினரைத் தேர்ந்தெடுக்கவும்"
        : "Select Family Member",

    loadingFamily:
      isTamil
        ? "குடும்ப உறுப்பினர்களை ஏற்றுகிறது..."
        : "Loading family members...",

    selectMember:
      isTamil
        ? "-- குடும்ப உறுப்பினரைத் தேர்ந்தெடுக்கவும் --"
        : "-- Select a family member --",

    retry:
      isTamil
        ? "மீண்டும் முயற்சி"
        : "Retry",

    addFamily:
      isTamil
        ? "குடும்ப உறுப்பினரைச் சேர்க்கவும்"
        : "Add Family Member",

    cancel:
      isTamil
        ? "ரத்து செய்"
        : "Cancel",

    addNewFamily:
      isTamil
        ? "புதிய குடும்ப உறுப்பினரைச் சேர்க்கவும்"
        : "Add New Family Member",

    fullName:
      isTamil
        ? "முழுப் பெயர்"
        : "Full Name",

    enterFullName:
      isTamil
        ? "முழுப் பெயரை உள்ளிடவும்"
        : "Enter full name",

    relationship:
      isTamil
        ? "உறவு"
        : "Relationship",

    age:
      isTamil
        ? "வயது"
        : "Age",

    enterAge:
      isTamil
        ? "வயதை உள்ளிடவும்"
        : "Enter age",

    saveFamily:
      isTamil
        ? "குடும்ப உறுப்பினரை சேமிக்கவும்"
        : "Save Family Member",

    savingFamily:
      isTamil
        ? "சேமிக்கிறது..."
        : "Saving Family Member...",

    patientName:
      isTamil
        ? "நோயாளியின் பெயர்"
        : "Patient Name",

    patientAge:
      isTamil
        ? "நோயாளியின் வயது"
        : "Patient Age",

    enterYourName:
      isTamil
        ? "உங்கள் பெயரை உள்ளிடவும்"
        : "Enter your name",

    selectMemberAbove:
      isTamil
        ? "மேலே குடும்ப உறுப்பினரைத் தேர்ந்தெடுக்கவும்"
        : "Select a family member above",

    medicalReportType:
      isTamil
        ? "மருத்துவ அறிக்கை வகை"
        : "Medical Report Type",

    clickUpload:
      isTamil
        ? "மருத்துவ அறிக்கையை பதிவேற்ற கிளிக் செய்யவும்"
        : "Click to Upload Medical Report",

    supportedFormats:
      isTamil
        ? "ஆதரிக்கப்படும் வடிவங்கள்: PDF, JPG, JPEG, PNG"
        : "Supported formats: PDF, JPG, JPEG, PNG",

    ready:
      isTamil
        ? "பகுப்பாய்விற்கு தயாராக உள்ளது"
        : "Ready for analysis",

    analyze:
      isTamil
        ? "MedVerse AI மூலம் அறிக்கையை பகுப்பாய்வு செய்யவும்"
        : "Analyze Report with MedVerse AI",

    analyzing:
      isTamil
        ? "அறிக்கையை பகுப்பாய்வு செய்கிறது..."
        : "Analyzing Report...",

    processing:
      isTamil
        ? "உங்கள் அறிக்கை செயலாக்கப்படுகிறது. தயவுசெய்து காத்திருக்கவும்..."
        : "Your report is being processed. Please wait...",

    bloodTest:
      isTamil
        ? "இரத்தப் பரிசோதனை"
        : "Blood Test",

    cbc:
      isTamil
        ? "முழுமையான இரத்தப் பரிசோதனை (CBC)"
        : "Complete Blood Count (CBC)",

    diabetes:
      isTamil
        ? "நீரிழிவு அறிக்கை"
        : "Diabetes Report",

    heart:
      isTamil
        ? "இதய ஆரோக்கியம்"
        : "Heart Health",

    kidney:
      isTamil
        ? "சிறுநீரக செயல்பாட்டு பரிசோதனை"
        : "Kidney Function Test",

    liver:
      isTamil
        ? "கல்லீரல் செயல்பாட்டு பரிசோதனை"
        : "Liver Function Test",

    thyroid:
      isTamil
        ? "தைராய்டு பரிசோதனை"
        : "Thyroid Test",

    urine:
      isTamil
        ? "சிறுநீர் பரிசோதனை"
        : "Urine Analysis",

    ecg:
      "ECG",

    xray:
      isTamil
        ? "எக்ஸ்ரே"
        : "X-Ray",

    mri:
      isTamil
        ? "MRI ஸ்கேன்"
        : "MRI Scan",

    ct:
      isTamil
        ? "CT ஸ்கேன்"
        : "CT Scan",

    other:
      isTamil
        ? "மற்றவை"
        : "Other",
  };

  // ============================================================
  // RELATIONSHIP TRANSLATION
  // ============================================================

  function translateRelationship(value: string) {
    if (!isTamil) {
      return value;
    }

    const relationships: Record<string, string> = {
      Father: "தந்தை",
      Mother: "தாய்",
      Sister: "சகோதரி",
      Brother: "சகோதரர்",
      Wife: "மனைவி",
      Husband: "கணவர்",
      Son: "மகன்",
      Daughter: "மகள்",
      Grandfather: "தாத்தா",
      Grandmother: "பாட்டி",
      Uncle: "மாமா",
      Aunt: "அத்தை",
      Other: "மற்றவர்",
    };

    return relationships[value] || value;
  }

  // ============================================================
  // FAMILY MEMBER ID HELPER
  // ============================================================

  function getFamilyMemberId(
    member: FamilyMember
  ): string {
    return String(
      member._id ??
        member.id ??
        member.member_id ??
        ""
    );
  }

  // ============================================================
  // AUTO SELECT FAMILY MEMBER
  // ============================================================

  useEffect(() => {
    const state = location.state as
      | {
          category?: string;
          familyMemberId?: string;
          patientName?: string;
          relationship?: string;
          age?: number | string;
        }
      | null;

    if (
      state &&
      state.category === "Family" &&
      state.familyMemberId
    ) {
      setCategory("Family");

      setSelectedFamilyMemberId(
        state.familyMemberId
      );

      setPatientName(
        state.patientName || ""
      );

      setRelationship(
        state.relationship || ""
      );

      setAge(
        String(state.age ?? "")
      );
    }
  }, [location.state]);

  // ============================================================
  // LOAD FAMILY MEMBERS
  // ============================================================

  useEffect(() => {
    if (category !== "Family") {
      return;
    }

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    let cancelled = false;

    async function fetchFamilyMembers() {
      setFamilyLoading(true);
      setFamilyError("");

      try {
        const response =
          await axios.get(
            `${API_URL}/family/my-family`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!cancelled) {
          const members =
            response.data.members ?? [];

          setFamilyMembers(members);

          // Re-select family member if coming
          // from FamilyMembers page.

          const state = location.state as
            | {
                familyMemberId?: string;
              }
            | null;

          if (state?.familyMemberId) {
            const selected =
              members.find(
                (member: FamilyMember) =>
                  getFamilyMemberId(member) ===
                  String(
                    state.familyMemberId
                  )
              );

            if (selected) {
              setSelectedFamilyMemberId(
                getFamilyMemberId(selected)
              );

              setPatientName(
                selected.name
              );

              setRelationship(
                selected.relationship
              );

              setAge(
                String(selected.age)
              );
            }
          }
        }
      } catch (error: any) {
        if (cancelled) {
          return;
        }

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

        setFamilyError(
          error.response?.data?.detail ??
            (
              isTamil
                ? "குடும்ப உறுப்பினர்களை ஏற்ற முடியவில்லை."
                : "Unable to load family members."
            )
        );
      } finally {
        if (!cancelled) {
          setFamilyLoading(false);
        }
      }
    }

    fetchFamilyMembers();

    return () => {
      cancelled = true;
    };
  }, [
    category,
    navigate,
    location.state,
    isTamil,
  ]);

  // ============================================================
  // CATEGORY CHANGE
  // ============================================================

  function handleCategoryChange(
    value: string
  ) {
    setCategory(value);

    setFile(null);

    setSelectedFamilyMemberId("");

    setPatientName("");

    setRelationship("");

    setAge("");

    setShowAddFamilyForm(false);

    setFamilyError("");
  }

  // ============================================================
  // SELECT FAMILY MEMBER
  // ============================================================

  function handleFamilyMemberChange(
    memberId: string
  ) {
    setSelectedFamilyMemberId(
      memberId
    );

    const member =
      familyMembers.find(
        (item) =>
          getFamilyMemberId(item) ===
          String(memberId)
      );

    console.log(
      "Selected Family Member:",
      member
    );

    if (member) {
      setPatientName(
        member.name
      );

      setRelationship(
        member.relationship
      );

      setAge(
        String(member.age)
      );
    } else {
      setPatientName("");
      setRelationship("");
      setAge("");
    }
  }

  // ============================================================
  // ADD FAMILY MEMBER
  // ============================================================

  async function handleAddFamilyMember() {
    const name =
      newMemberName.trim();

    const ageNumber =
      Number(newMemberAge);

    if (!name) {
      alert(
        isTamil
          ? "குடும்ப உறுப்பினரின் பெயரை உள்ளிடவும்."
          : "Please enter the family member's name."
      );

      return;
    }

    if (
      newMemberAge.trim() === "" ||
      !Number.isInteger(ageNumber) ||
      ageNumber < 0 ||
      ageNumber > 120
    ) {
      alert(
        isTamil
          ? "0 முதல் 120 வரை சரியான வயதை உள்ளிடவும்."
          : "Please enter a valid age between 0 and 120."
      );

      return;
    }

    const token =
      localStorage.getItem(
        "access_token"
      );

    if (!token) {
      alert(
        isTamil
          ? "மீண்டும் உள்நுழையவும்."
          : "Please login again."
      );

      navigate("/login");

      return;
    }

    try {
      setAddingMember(true);

      const response =
        await axios.post(
          `${API_URL}/family/add`,
          {
            name: name,
            relationship:
              newMemberRelationship,
            age: ageNumber,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const newMember: FamilyMember = {
        _id: String(
          response.data.member_id ??
            response.data._id ??
            response.data.id ??
            ""
        ),

        name: name,

        relationship:
          newMemberRelationship,

        age: ageNumber,
      };

      setFamilyMembers(
        (previous) => [
          ...previous,
          newMember,
        ]
      );

      setSelectedFamilyMemberId(
        getFamilyMemberId(newMember)
      );

      setPatientName(
        newMember.name
      );

      setRelationship(
        newMember.relationship
      );

      setAge(
        String(newMember.age)
      );

      setNewMemberName("");

      setNewMemberRelationship(
        "Sister"
      );

      setNewMemberAge("");

      setShowAddFamilyForm(
        false
      );

      alert(
        isTamil
          ? "குடும்ப உறுப்பினர் வெற்றிகரமாக சேர்க்கப்பட்டார்!"
          : "Family member added successfully!"
      );
    } catch (error: any) {
      console.error(
        "Add family member error:",
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

      alert(
        error.response?.data?.detail ??
          (
            isTamil
              ? "குடும்ப உறுப்பினரை சேர்க்க முடியவில்லை."
              : "Unable to add family member."
          )
      );
    } finally {
      setAddingMember(false);
    }
  }

  // ============================================================
  // FILE SELECTION
  // ============================================================

  function handleFile(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const allowedExtensions =
      /\.(pdf|jpe?g|png)$/i;

    if (
      !allowedExtensions.test(
        selectedFile.name
      )
    ) {
      alert(
        isTamil
          ? "PDF, JPG, JPEG மற்றும் PNG கோப்புகள் மட்டுமே அனுமதிக்கப்படும்."
          : "Only PDF, JPG, JPEG and PNG files are allowed."
      );

      e.target.value = "";

      return;
    }

    setFile(
      selectedFile
    );
  }

  // ============================================================
  // REMOVE FILE
  // ============================================================

  function removeFile() {
    setFile(null);
  }

  // ============================================================
  // ANALYZE REPORT
  // ============================================================

  async function analyzeReport() {
    // ----------------------------------------------------------
    // FILE VALIDATION
    // ----------------------------------------------------------

    if (!file) {
      alert(
        isTamil
          ? "மருத்துவ அறிக்கையை பதிவேற்றவும்."
          : "Please upload a medical report."
      );

      return;
    }

    // ----------------------------------------------------------
    // FIND SELECTED FAMILY MEMBER
    // ----------------------------------------------------------

    const selectedMember =
      category === "Family"
        ? familyMembers.find(
            (member) =>
              getFamilyMemberId(member) ===
              String(
                selectedFamilyMemberId
              )
          )
        : null;

    // ----------------------------------------------------------
    // FAMILY VALIDATION
    // ----------------------------------------------------------

    if (
      category === "Family" &&
      !selectedFamilyMemberId
    ) {
      alert(
        isTamil
          ? "குடும்ப உறுப்பினரைத் தேர்ந்தெடுக்கவும்."
          : "Please select a family member."
      );

      return;
    }

    if (
      category === "Family" &&
      !selectedMember
    ) {
      alert(
        isTamil
          ? "தேர்ந்தெடுக்கப்பட்ட குடும்ப உறுப்பினர் கிடைக்கவில்லை. மீண்டும் தேர்ந்தெடுக்கவும்."
          : "Selected family member could not be found. Please select the member again."
      );

      return;
    }

    // ----------------------------------------------------------
    // FINAL PATIENT DETAILS
    // ----------------------------------------------------------

    const finalPatientName =
      category === "Family"
        ? selectedMember!.name
        : patientName.trim();

    const finalRelationship =
      category === "Family"
        ? selectedMember!.relationship
        : relationship;

    const finalAge =
      category === "Family"
        ? String(
            selectedMember!.age
          )
        : age;

    // ----------------------------------------------------------
    // MY REPORT VALIDATION
    // ----------------------------------------------------------

    if (
      category === "Mine" &&
      !finalPatientName
    ) {
      alert(
        isTamil
          ? "நோயாளியின் பெயரை உள்ளிடவும்."
          : "Please enter the patient's name."
      );

      return;
    }

    if (
      category === "Mine" &&
      (
        finalAge.trim() === "" ||
        !Number.isInteger(
          Number(finalAge)
        ) ||
        Number(finalAge) <= 0 ||
        Number(finalAge) > 130
      )
    ) {
      alert(
        isTamil
          ? "சரியான வயதை உள்ளிடவும்."
          : "Please enter a valid age."
      );

      return;
    }

    // ----------------------------------------------------------
    // JWT TOKEN
    // ----------------------------------------------------------

    const token =
      localStorage.getItem(
        "access_token"
      );

    if (!token) {
      alert(
        isTamil
          ? "மீண்டும் உள்நுழையவும்."
          : "Please login again."
      );

      navigate("/login");

      return;
    }

    // ----------------------------------------------------------
    // SEND TO BACKEND
    // ----------------------------------------------------------

    try {
      setLoading(true);

      const formData = new FormData();

// Required by the backend
      formData.append("file", file);

// Selected application language
      formData.append("language", language);

      formData.append(
        "patient_type",
          category === "Mine" ? "self" : "family"
      );

      // --------------------------------------------------------
      // FAMILY MEMBER ID
      // --------------------------------------------------------

      if (
        category === "Family"
      ) {
        formData.append(
          "family_member_id",
          selectedFamilyMemberId
        );
      }

      // --------------------------------------------------------
      // PATIENT DETAILS
      // --------------------------------------------------------

      formData.append(
        "patient_name",
        finalPatientName
      );

      formData.append(
        "patient_age",
        finalAge
      );

      formData.append(
        "report_type",
        reportType
      );

      // --------------------------------------------------------
      // FAMILY DETAILS
      // --------------------------------------------------------

      if (
        category === "Family"
      ) {
        formData.append(
          "family_member_name",
          finalPatientName
        );

        formData.append(
          "family_member_relationship",
          finalRelationship
        );

        formData.append(
          "family_member_age",
          finalAge
        );
      }

      // --------------------------------------------------------
      // DEBUG
      // --------------------------------------------------------

      console.log(
        "MEDVERSE AI - UPLOAD PAYLOAD"
      );

      formData.forEach(
        (value, key) => {
          console.log(
            key,
            value instanceof File
              ? value.name
              : value
          );
        }
      );

      // --------------------------------------------------------
      // API REQUEST
      // --------------------------------------------------------

      const response =
        await axios.post(
          `${API_URL}/analysis/analyze`,
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      console.log(
        "Medical analysis response:",
        response.data
      );

      // --------------------------------------------------------
      // NAVIGATE TO ANALYSIS
      // --------------------------------------------------------

      navigate(
        "/analysis",
        {
          state: {
            category,

            patient_type:
              category === "Mine"
                ? "self"
                : "family",

            familyMemberId:
              category === "Family"
                ? selectedFamilyMemberId
                : null,

            patientName:
              finalPatientName,

            relationship:
              finalRelationship,

            age:
              finalAge,

            reportType,

            fileName:
              file.name,

            uploadDate:
              new Date().toLocaleDateString(),

            analysis:
              response.data.analysis,

            reportId:
              response.data.report_id,
          },
        }
      );
    } catch (error: any) {
      console.error(
        "Medical analysis error:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        alert(
          isTamil
            ? "அமர்வு காலாவதியாகிவிட்டது. மீண்டும் உள்நுழையவும்."
            : "Session expired. Please login again."
        );

        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "token_type"
        );

        navigate("/login");

        return;
      }

      console.error(
        "Backend response:",
        error.response?.data
      );

      alert(
        error.response?.data?.detail ??
          (
            isTamil
              ? "மருத்துவ அறிக்கையை பகுப்பாய்வு செய்ய முடியவில்லை."
              : "Unable to analyze the medical report."
          )
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex justify-center p-4 sm:p-8">
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-xl sm:p-8"
        >
          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft />
            {t.back}
          </button>

          {/* TITLE */}

          <h1 className="text-3xl font-bold text-gray-800">
            {t.title}
          </h1>

          <p className="mt-2 text-gray-500">
            {t.subtitle}
          </p>

          {/* PATIENT CATEGORY */}

          <section className="mt-8">
            <h2 className="mb-4 text-lg font-semibold">
              {t.patientCategory}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* MY REPORT */}

              <button
                type="button"
                onClick={() =>
                  handleCategoryChange(
                    "Mine"
                  )
                }
                className={`rounded-xl border p-5 transition ${
                  category === "Mine"
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "bg-white hover:bg-blue-50"
                }`}
              >
                <FaUser
                  className="mx-auto mb-2 text-2xl"
                />

                {t.myReport}
              </button>

              {/* FAMILY REPORT */}

              <button
                type="button"
                onClick={() =>
                  handleCategoryChange(
                    "Family"
                  )
                }
                className={`rounded-xl border p-5 transition ${
                  category === "Family"
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "bg-white hover:bg-blue-50"
                }`}
              >
                <FaUsers
                  className="mx-auto mb-2 text-2xl"
                />

                {t.familyReport}
              </button>
            </div>
          </section>

          {/* FAMILY SECTION */}

          {category === "Family" && (
            <section className="mt-8">
              <label className="font-semibold">
                {t.selectFamilyMember}
              </label>

              {familyLoading ? (
                <p className="mt-3 text-gray-500">
                  {t.loadingFamily}
                </p>
              ) : familyError ? (
                <div className="mt-3 rounded-xl bg-red-50 p-4 text-red-700">
                  {familyError}

                  <button
                    type="button"
                    onClick={() =>
                      window.location.reload()
                    }
                    className="ml-2 font-semibold underline"
                  >
                    {t.retry}
                  </button>
                </div>
              ) : (
                <select
                  value={
                    selectedFamilyMemberId
                  }
                  onChange={(e) =>
                    handleFamilyMemberChange(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border p-3"
                >
                  <option value="">
                    {t.selectMember}
                  </option>

                  {familyMembers.map(
                    (member) => (
                      <option
                        key={getFamilyMemberId(
                          member
                        )}
                        value={getFamilyMemberId(
                          member
                        )}
                      >
                        {member.name} (
                        {translateRelationship(
                          member.relationship
                        )}
                        )
                      </option>
                    )
                  )}
                </select>
              )}

              {/* ADD FAMILY MEMBER */}

              <button
                type="button"
                onClick={() =>
                  setShowAddFamilyForm(
                    (previous) =>
                      !previous
                  )
                }
                className="mt-4 flex items-center gap-2 rounded-xl border border-blue-600 px-5 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                <FaUserPlus />

                {showAddFamilyForm
                  ? t.cancel
                  : t.addFamily}
              </button>

              {/* ADD FAMILY MEMBER FORM */}

              {showAddFamilyForm && (
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <h3 className="mb-4 text-lg font-bold text-gray-800">
                    {t.addNewFamily}
                  </h3>

                  <div className="space-y-4">
                    {/* NAME */}

                    <div>
                      <label className="font-medium">
                        {t.fullName}
                      </label>

                      <input
                        type="text"
                        value={
                          newMemberName
                        }
                        onChange={(e) =>
                          setNewMemberName(
                            e.target.value
                          )
                        }
                        placeholder={
                          t.enterFullName
                        }
                        className="mt-2 w-full rounded-xl border bg-white p-3"
                      />
                    </div>

                    {/* RELATIONSHIP */}

                    <div>
                      <label className="font-medium">
                        {t.relationship}
                      </label>

                      <select
                        value={
                          newMemberRelationship
                        }
                        onChange={(e) =>
                          setNewMemberRelationship(
                            e.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border bg-white p-3"
                      >
                        <option value="Father">
                          {isTamil
                            ? "தந்தை"
                            : "Father"}
                        </option>

                        <option value="Mother">
                          {isTamil
                            ? "தாய்"
                            : "Mother"}
                        </option>

                        <option value="Sister">
                          {isTamil
                            ? "சகோதரி"
                            : "Sister"}
                        </option>

                        <option value="Brother">
                          {isTamil
                            ? "சகோதரர்"
                            : "Brother"}
                        </option>

                        <option value="Wife">
                          {isTamil
                            ? "மனைவி"
                            : "Wife"}
                        </option>

                        <option value="Husband">
                          {isTamil
                            ? "கணவர்"
                            : "Husband"}
                        </option>

                        <option value="Son">
                          {isTamil
                            ? "மகன்"
                            : "Son"}
                        </option>

                        <option value="Daughter">
                          {isTamil
                            ? "மகள்"
                            : "Daughter"}
                        </option>

                        <option value="Grandfather">
                          {isTamil
                            ? "தாத்தா"
                            : "Grandfather"}
                        </option>

                        <option value="Grandmother">
                          {isTamil
                            ? "பாட்டி"
                            : "Grandmother"}
                        </option>

                        <option value="Uncle">
                          {isTamil
                            ? "மாமா"
                            : "Uncle"}
                        </option>

                        <option value="Aunt">
                          {isTamil
                            ? "அத்தை"
                            : "Aunt"}
                        </option>

                        <option value="Other">
                          {t.other}
                        </option>
                      </select>
                    </div>

                    {/* AGE */}

                    <div>
                      <label className="font-medium">
                        {t.age}
                      </label>

                      <input
                        type="number"
                        min="0"
                        max="120"
                        step="1"
                        value={
                          newMemberAge
                        }
                        onChange={(e) =>
                          setNewMemberAge(
                            e.target.value
                          )
                        }
                        placeholder={
                          t.enterAge
                        }
                        className="mt-2 w-full rounded-xl border bg-white p-3"
                      />
                    </div>

                    {/* SAVE */}

                    <button
                      type="button"
                      onClick={
                        handleAddFamilyMember
                      }
                      disabled={
                        addingMember
                      }
                      className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {addingMember
                        ? t.savingFamily
                        : t.saveFamily}
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* PATIENT INFORMATION */}

          <section className="mt-8 grid gap-6 md:grid-cols-2">
            {/* NAME */}

            <div>
              <label className="font-semibold">
                {t.patientName}
              </label>

              <input
                type="text"
                value={
                  patientName
                }
                onChange={(e) =>
                  setPatientName(
                    e.target.value
                  )
                }
                readOnly={
                  category === "Family"
                }
                placeholder={
                  category === "Mine"
                    ? t.enterYourName
                    : t.selectMemberAbove
                }
                className="mt-2 w-full rounded-xl border p-3 read-only:bg-gray-100"
              />
            </div>

            {/* AGE */}

            <div>
              <label className="font-semibold">
                {t.patientAge}
              </label>

              <input
                type="number"
                min="1"
                max="130"
                value={age}
                onChange={(e) =>
                  setAge(
                    e.target.value
                  )
                }
                readOnly={
                  category === "Family"
                }
                placeholder={
                  t.enterAge
                }
                className="mt-2 w-full rounded-xl border p-3 read-only:bg-gray-100"
              />
            </div>
          </section>

          {/* RELATIONSHIP */}

          {category === "Family" && (
            <div className="mt-4">
              <label className="font-semibold">
                {t.relationship}
              </label>

              <input
                type="text"
                value={
                  translateRelationship(
                    relationship
                  )
                }
                readOnly
                placeholder={
                  isTamil
                    ? "குடும்ப உறுப்பினரைத் தேர்ந்தெடுக்கவும்"
                    : "Select a family member"
                }
                className="mt-2 w-full rounded-xl border bg-gray-100 p-3"
              />
            </div>
          )}

          {/* REPORT TYPE */}

          <section className="mt-8">
            <label className="font-semibold">
              {t.medicalReportType}
            </label>

            <select
              value={reportType}
              onChange={(e) =>
                setReportType(
                  e.target.value
                )
              }
              className="mt-2 w-full rounded-xl border p-3"
            >
              <option value="Blood Test">
                {t.bloodTest}
              </option>

              <option value="Complete Blood Count (CBC)">
                {t.cbc}
              </option>

              <option value="Diabetes Report">
                {t.diabetes}
              </option>

              <option value="Heart Health">
                {t.heart}
              </option>

              <option value="Kidney Function Test">
                {t.kidney}
              </option>

              <option value="Liver Function Test">
                {t.liver}
              </option>

              <option value="Thyroid Test">
                {t.thyroid}
              </option>

              <option value="Urine Analysis">
                {t.urine}
              </option>

              <option value="ECG">
                {t.ecg}
              </option>

              <option value="X-Ray">
                {t.xray}
              </option>

              <option value="MRI Scan">
                {t.mri}
              </option>

              <option value="CT Scan">
                {t.ct}
              </option>

              <option value="Other">
                {t.other}
              </option>
            </select>
          </section>

          {/* FILE UPLOAD */}

          {!file ? (
            <label className="mt-8 block cursor-pointer rounded-2xl border-2 border-dashed border-blue-400 p-10 text-center transition hover:bg-blue-50">
              <FaUpload
                className="mx-auto text-blue-600"
                size={45}
              />

              <p className="mt-4 font-semibold">
                {t.clickUpload}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {t.supportedFormats}
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
                  size={26}
                />

                <div>
                  <p className="break-all font-semibold">
                    {file.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {t.ready}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  removeFile
                }
                aria-label={
                  isTamil
                    ? "பதிவேற்றப்பட்ட அறிக்கையை அகற்றவும்"
                    : "Remove uploaded report"
                }
                className="ml-3 text-red-500 hover:text-red-700"
              >
                <FaTimes
                  size={20}
                />
              </button>
            </div>
          )}

          {/* ANALYZE BUTTON */}

          <button
            type="button"
            onClick={
              analyzeReport
            }
            disabled={
              loading ||
              addingMember ||
              familyLoading ||
              (
                category === "Family" &&
                !selectedFamilyMemberId
              )
            }
            className="mt-8 w-full rounded-2xl bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading
              ? t.analyzing
              : t.analyze}
          </button>

          {/* LOADING */}

          {loading && (
            <p className="mt-3 text-center text-sm text-gray-500">
              {t.processing}
            </p>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default Upload;