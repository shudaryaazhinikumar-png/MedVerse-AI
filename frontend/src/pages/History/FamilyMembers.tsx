import { motion } from "framer-motion";

import {
  FaUserPlus,
  FaUser,
  FaTrash,
  FaTimes,
  FaFileMedical,
  FaEye,
} from "react-icons/fa";

import { useEffect, useState } from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import { useLanguage } from "../../context/LanguageContext";

interface FamilyMember {
  _id: string;
  name: string;
  relationship: string;
  age: number;
}

interface Report {
  _id: string;
  filename?: string;
  report_type?: string;
  created_at?: string;

  patient_type?: string;
  patient_name?: string;

  family_member_id?: string | null;
  family_member_name?: string;
  family_member_relationship?: string;
  family_member_age?: number | string;
}

function FamilyMembers() {
  const navigate = useNavigate();

  // ============================================================
  // GLOBAL LANGUAGE
  // ============================================================

  const { language } = useLanguage();

  const isTamil = language === "Tamil";

  // ============================================================
  // FAMILY MEMBERS
  // ============================================================

  const [members, setMembers] = useState<FamilyMember[]>([]);

  // ============================================================
  // REPORTS
  // ============================================================

  const [reports, setReports] = useState<Report[]>([]);

  // ============================================================
  // LOADING
  // ============================================================

  const [loading, setLoading] = useState(true);

  const [reportsLoading, setReportsLoading] = useState(true);

  // ============================================================
  // ADD FORM
  // ============================================================

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");

  const [relationship, setRelationship] = useState("");

  const [age, setAge] = useState("");

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // TRANSLATIONS
  // ============================================================

  const t = {
    addFamilyMember: isTamil
      ? "குடும்ப உறுப்பினரைச் சேர்க்கவும்"
      : "Add Family Member",

    name: isTamil ? "பெயர்" : "Name",

    enterName: isTamil ? "பெயரை உள்ளிடவும்" : "Enter name",

    relationship: isTamil ? "உறவு" : "Relationship",

    relationshipPlaceholder: isTamil
      ? "தந்தை / தாய் / சகோதரி"
      : "Father / Mother / Sister",

    age: isTamil ? "வயது" : "Age",

    enterAge: isTamil ? "வயதை உள்ளிடவும்" : "Enter age",

    adding: isTamil ? "சேர்க்கப்படுகிறது..." : "Adding...",

    addMember: isTamil ? "உறுப்பினரைச் சேர்க்கவும்" : "Add Member",

    retry: isTamil ? "மீண்டும் முயற்சிக்கவும்" : "Retry",

    noFamilyMembers: isTamil
      ? "குடும்ப உறுப்பினர்கள் இல்லை"
      : "No Family Members",

    addFamilyDescription: isTamil
      ? "அவர்களின் மருத்துவ அறிக்கைகளை நிர்வகிக்க குடும்ப உறுப்பினரைச் சேர்க்கவும்."
      : "Add a family member to manage their medical reports.",

    years: isTamil ? "வயது" : "Years",

    reports: isTamil ? "அறிக்கைகள்" : "Reports",

    latestReport: isTamil
      ? "சமீபத்திய அறிக்கை"
      : "Latest Report",

    medicalReport: isTamil
      ? "மருத்துவ அறிக்கை"
      : "Medical Report",

    viewLatestReport: isTamil
      ? "சமீபத்திய அறிக்கையைப் பார்க்கவும்"
      : "View Latest Report",

    uploadReport: isTamil
      ? "அறிக்கையைப் பதிவேற்றவும்"
      : "Upload Report",

    loadingFamilyMembers: isTamil
      ? "குடும்ப உறுப்பினர்கள் ஏற்றப்படுகின்றனர்..."
      : "Loading family members...",

    deleteFamilyMember: isTamil
      ? "குடும்ப உறுப்பினரை நீக்கவும்"
      : "Delete family member",

    deleteConfirm: isTamil
      ? "இந்த குடும்ப உறுப்பினரை நிச்சயமாக நீக்க விரும்புகிறீர்களா?"
      : "Are you sure you want to delete this family member?",

    enterMemberName: isTamil
      ? "குடும்ப உறுப்பினரின் பெயரை உள்ளிடவும்."
      : "Please enter the family member name.",

    enterRelationship: isTamil
      ? "உறவை உள்ளிடவும்."
      : "Please enter the relationship.",

    enterAgeError: isTamil
      ? "வயதை உள்ளிடவும்."
      : "Please enter the age.",

    validAge: isTamil
      ? "0 முதல் 120 வரை சரியான வயதை உள்ளிடவும்."
      : "Please enter a valid age between 0 and 120.",

    unableLoad: isTamil
      ? "குடும்ப உறுப்பினர்களை ஏற்ற முடியவில்லை"
      : "Unable to load family members",

    unableAdd: isTamil
      ? "குடும்ப உறுப்பினரைச் சேர்க்க முடியவில்லை"
      : "Unable to add family member",

    unableDelete: isTamil
      ? "குடும்ப உறுப்பினரை நீக்க முடியவில்லை"
      : "Unable to delete family member",

    onlyAllowedFiles: isTamil
      ? "PDF, JPG, JPEG மற்றும் PNG கோப்புகள் மட்டுமே அனுமதிக்கப்படும்."
      : "Only PDF, JPG, JPEG and PNG files are allowed.",
  };

  // ============================================================
  // FETCH FAMILY MEMBERS
  // ============================================================

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://127.0.0.1:8000/family/my-family",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Family Members:", response.data);

      setMembers(response.data.members || []);
    } catch (error: any) {
      console.error("Failed to load family members:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token_type");

        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.detail || t.unableLoad
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FETCH REPORTS
  // ============================================================

  const fetchReports = async () => {
    try {
      setReportsLoading(true);

      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://127.0.0.1:8000/reports/my-reports",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Reports for family count:",
        response.data
      );

      setReports(response.data.reports || []);
    } catch (error: any) {
      console.error("Failed to load reports:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token_type");

        navigate("/login");
        return;
      }
    } finally {
      setReportsLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchMembers();
    fetchReports();
  }, []);

  // ============================================================
  // COUNT REPORTS FOR MEMBER
  // ============================================================

  const getMemberReports = (memberId: string) => {
    return reports.filter(
      (report) =>
        report.family_member_id === memberId
    );
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return "--";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return date.toLocaleDateString(
      isTamil ? "ta-IN" : "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ============================================================
  // ADD FAMILY MEMBER
  // ============================================================

  const handleAddMember = async () => {
    if (!name.trim()) {
      alert(t.enterMemberName);
      return;
    }

    if (!relationship.trim()) {
      alert(t.enterRelationship);
      return;
    }

    if (!age) {
      alert(t.enterAgeError);
      return;
    }

    const ageNumber = Number(age);

    if (
      !Number.isInteger(ageNumber) ||
      ageNumber < 0 ||
      ageNumber > 120
    ) {
      alert(t.validAge);
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      await axios.post(
        "http://127.0.0.1:8000/family/add",
        {
          name: name.trim(),
          relationship: relationship.trim(),
          age: ageNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clear form
      setName("");
      setRelationship("");
      setAge("");

      setShowForm(false);

      // Reload members
      await fetchMembers();

      alert(
        isTamil
          ? "குடும்ப உறுப்பினர் வெற்றிகரமாகச் சேர்க்கப்பட்டார்!"
          : "Family member added successfully!"
      );
    } catch (error: any) {
      console.error(
        "Failed to add family member:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token_type");

        navigate("/login");
        return;
      }

      alert(
        error.response?.data?.detail ||
          t.unableAdd
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE FAMILY MEMBER
  // ============================================================

  const handleDeleteMember = async (
    memberId: string
  ) => {
    const confirmed = window.confirm(
      t.deleteConfirm
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      await axios.delete(
        `http://127.0.0.1:8000/family/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchMembers();

      alert(
        isTamil
          ? "குடும்ப உறுப்பினர் நீக்கப்பட்டார்."
          : "Family member deleted successfully!"
      );
    } catch (error: any) {
      console.error(
        "Failed to delete family member:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token_type");

        navigate("/login");
        return;
      }

      alert(
        error.response?.data?.detail ||
          t.unableDelete
      );
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-500 text-lg">
          {t.loadingFamilyMembers}
        </p>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div>

      {/* ====================================================== */}
      {/* ADD BUTTON */}
      {/* ====================================================== */}

      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="mb-6 flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition"
      >
        <FaUserPlus />
        {t.addFamilyMember}
      </button>

      {/* ====================================================== */}
      {/* ADD FORM */}
      {/* ====================================================== */}

      {showForm && (
        <div className="mb-8 bg-white rounded-2xl shadow p-6">

          <div className="flex justify-between items-center mb-5">

            <h2 className="text-xl font-bold">
              {t.addFamilyMember}
            </h2>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>

          </div>

          <div className="grid md:grid-cols-3 gap-4">

            {/* NAME */}

            <div>

              <label className="block text-sm font-medium text-gray-600 mb-2">
                {t.name}
              </label>

              <input
                type="text"
                placeholder={t.enterName}
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* RELATIONSHIP */}

            <div>

              <label className="block text-sm font-medium text-gray-600 mb-2">
                {t.relationship}
              </label>

              <input
                type="text"
                placeholder={t.relationshipPlaceholder}
                value={relationship}
                onChange={(e) =>
                  setRelationship(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* AGE */}

            <div>

              <label className="block text-sm font-medium text-gray-600 mb-2">
                {t.age}
              </label>

              <input
                type="number"
                min="0"
                max="120"
                placeholder={t.enterAge}
                value={age}
                onChange={(e) =>
                  setAge(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

          </div>

          <button
            type="button"
            onClick={handleAddMember}
            disabled={saving}
            className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? t.adding : t.addMember}
          </button>

        </div>
      )}

      {/* ====================================================== */}
      {/* ERROR */}
      {/* ====================================================== */}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">

          {error}

          <button
            type="button"
            onClick={fetchMembers}
            className="ml-3 underline font-medium"
          >
            {t.retry}
          </button>

        </div>
      )}

      {/* ====================================================== */}
      {/* NO MEMBERS */}
      {/* ====================================================== */}

      {members.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl shadow p-10 text-center">

          <FaUser className="mx-auto text-5xl text-gray-300" />

          <h3 className="text-xl font-bold mt-4">
            {t.noFamilyMembers}
          </h3>

          <p className="text-gray-500 mt-2">
            {t.addFamilyDescription}
          </p>

        </div>
      )}

      {/* ====================================================== */}
      {/* FAMILY MEMBER CARDS */}
      {/* ====================================================== */}

      {members.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">

          {members.map((member) => {

            const memberReports =
              getMemberReports(member._id);

            return (

              <motion.div
                key={member._id}
                whileHover={{
                  scale: 1.02,
                }}
                className="bg-white rounded-2xl shadow p-6 relative"
              >

                {/* DELETE */}

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteMember(member._id)
                  }
                  className="absolute top-5 right-5 text-red-400 hover:text-red-600"
                  title={t.deleteFamilyMember}
                >
                  <FaTrash />
                </button>

                {/* ICON */}

                <div className="text-blue-600 text-3xl">
                  <FaUser />
                </div>

                {/* NAME */}

                <h3 className="mt-4 text-xl font-bold">
                  {member.name}
                </h3>

                {/* RELATIONSHIP */}

                <p className="text-gray-500">
                  {member.relationship}
                </p>

                {/* AGE */}

                <p>
                  {t.age}: {member.age}{" "}
                  {t.years}
                </p>

                {/* REPORT COUNT */}

                <p className="mt-3 text-blue-600 font-medium">

                  {t.reports}:{" "}

                  {reportsLoading
                    ? "..."
                    : memberReports.length}

                </p>

                {/* ================================================= */}
                {/* LATEST REPORT */}
                {/* ================================================= */}

                {memberReports.length > 0 && (
                  <div className="mt-4 border-t pt-4">

                    <p className="text-sm font-semibold text-gray-700">
                      {t.latestReport}
                    </p>

                    <p className="text-sm text-gray-600 mt-1 truncate">

                      {memberReports[0].filename ||
                        t.medicalReport}

                    </p>

                    <p className="text-xs text-gray-400 mt-1">

                      {formatDate(
                        memberReports[0].created_at
                      )}

                    </p>

                  </div>
                )}

                {/* ================================================= */}
                {/* VIEW REPORT */}
                {/* ================================================= */}

                {memberReports.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/analysis", {
                        state: {
                          category: "Family",

                          patient_type: "family",

                          familyMemberId:
                            member._id,

                          patientName:
                            member.name,

                          relationship:
                            member.relationship,

                          age: String(member.age),

                          reportType:
                            memberReports[0]
                              .report_type ||
                            "Medical Report",

                          fileName:
                            memberReports[0]
                              .filename ||
                            "Medical Report",

                          uploadDate:
                            formatDate(
                              memberReports[0]
                                .created_at
                            ),

                          reportId:
                            memberReports[0]._id,

                          analysis:
                            memberReports[0],
                        },
                      })
                    }
                    className="mt-4 w-full flex items-center justify-center gap-2 border border-blue-200 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50"
                  >
                    <FaEye />
                    {t.viewLatestReport}
                  </button>
                )}

                {/* ================================================= */}
                {/* UPLOAD REPORT */}
                {/* ================================================= */}

                <button
                  type="button"
                  onClick={() =>
                    navigate("/upload", {
                      state: {
                        category: "Family",
                        familyMemberId:
                          member._id,
                        patientName:
                          member.name,
                        relationship:
                          member.relationship,
                        age: member.age,
                      },
                    })
                  }
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                >
                  <FaFileMedical />
                  {t.uploadReport}
                </button>

              </motion.div>

            );

          })}

        </div>
      )}

    </div>
  );
}

export default FamilyMembers;