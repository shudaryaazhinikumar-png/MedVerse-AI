import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import logo from "../../assets/images/medverselogo.png";

// ============================================================
// TYPES
// ============================================================

type Language = "English" | "Tamil";

type Message = {
  sender: "user" | "ai";
  text: string;
};

type SpeechRecognitionEventLike = Event & {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionErrorEventLike = Event & {
  error: string;
};

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult:
    ((event: SpeechRecognitionEventLike) => void) | null;
  onerror:
    ((event: SpeechRecognitionErrorEventLike) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// ============================================================
// CHAT COMPONENT
// ============================================================

function Chat() {
  const navigate = useNavigate();
  const location = useLocation();

  const report = location.state || {};

  const patientName =
    report.patientName || "Patient";

  const reportType =
    report.reportType || "Medical Report";

  // ==========================================================
  // STATE
  // ==========================================================

  const [language, setLanguage] =
    useState<Language>("English");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [isListening, setIsListening] =
    useState(false);

  const [speechSupported, setSpeechSupported] =
    useState(true);

  const [speechSynthesisSupported, setSpeechSynthesisSupported] =
    useState(true);

  const [speakingMessageIndex, setSpeakingMessageIndex] =
    useState<number | null>(null);

  const [autoVoice, setAutoVoice] =
    useState(false);

  const recognitionRef =
    useRef<SpeechRecognitionLike | null>(null);

  // ==========================================================
  // WELCOME MESSAGE
  // ==========================================================

  const getWelcomeMessage = (
    selectedLanguage: Language
  ): string => {
    if (selectedLanguage === "Tamil") {
      return `வணக்கம் ${patientName}! 👋

நான் MedVerse AI.

உங்கள் **${reportType}** அறிக்கையைப் புரிந்துகொள்ளவும், பரிசோதனை முடிவுகளை விளக்கவும், உங்கள் அறிக்கை தொடர்பான கேள்விகளுக்கு பதிலளிக்கவும் நான் உதவுகிறேன்.

நீங்கள் கேட்கலாம்:

- எனது MCV என்றால் என்ன?
- எனது Hemoglobin ஏன் குறைவாக உள்ளது?
- எந்த பரிசோதனை முடிவுகள் abnormal ஆக உள்ளன?
- எனது அறிக்கையை எளிமையாக விளக்குங்கள்.

மேலும் கீழே உள்ள 🎤 microphone button-ஐ அழுத்தி தமிழில் பேசலாம்.`;
    }

    return `Hello ${patientName}! 👋

I'm MedVerse AI.

I'm ready to help you understand your **${reportType}**, explain your test results, and answer questions about your medical report.

You can ask things like:

- What does my MCV mean?
- Why is my hemoglobin low?
- Which values are abnormal?
- Explain my report in simple terms.

You can also press the 🎤 microphone button and speak in English.`;
  };

  // ==========================================================
  // RESET WELCOME MESSAGE WHEN LANGUAGE CHANGES
  // ==========================================================

  useEffect(() => {
    setMessages([
      {
        sender: "ai",
        text: getWelcomeMessage(language),
      },
    ]);

    window.speechSynthesis?.cancel();

    setSpeakingMessageIndex(null);
  }, [language, patientName, reportType]);

  // ==========================================================
  // SUGGESTED QUESTIONS
  // ==========================================================

  const suggestedQuestions =
    language === "Tamil"
      ? [
          "எனது MCV ஏன் குறைவாக உள்ளது?",
          "எனது Hemoglobin பற்றி விளக்குங்கள்",
          "எந்த மதிப்புகள் abnormal ஆக உள்ளன?",
          "எனது அறிக்கையை எளிமையாக விளக்குங்கள்",
        ]
      : [
          "Why is my MCV low?",
          "Explain my hemoglobin",
          "Which values are abnormal?",
          "Explain my report in simple terms",
        ];

  // ==========================================================
  // INITIALIZE SPEECH RECOGNITION
  // ==========================================================

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (
      event: SpeechRecognitionEventLike
    ) => {
      const transcript =
        event.results[0][0].transcript;

      setInput((previous) => {
        if (previous.trim()) {
          return `${previous} ${transcript}`;
        }

        return transcript;
      });
    };

    recognition.onerror = (
      event: SpeechRecognitionErrorEventLike
    ) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current =
      recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Ignore stop errors
      }

      recognitionRef.current = null;
    };
  }, []);

  // ============================================================
  // CHANGE SPEECH RECOGNITION LANGUAGE
  // ============================================================

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang =
        language === "Tamil"
          ? "ta-IN"
          : "en-IN";
    }
  }, [language]);

  // ============================================================
  // TEXT TO SPEECH SUPPORT
  // ============================================================

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setSpeechSynthesisSupported(false);
      return;
    }

    setSpeechSynthesisSupported(true);

    const loadVoices = () => {
      const voices =
        window.speechSynthesis.getVoices();

      console.log(
        "=============================="
      );

      console.log(
        "AVAILABLE TTS VOICES"
      );

      console.log(
        "=============================="
      );

      voices.forEach((voice) => {
        console.log(
          `${voice.name} → ${voice.lang}`
        );
      });

      console.log(
        "=============================="
      );
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged =
      loadVoices;

    return () => {
      window.speechSynthesis.cancel();

      window.speechSynthesis.onvoiceschanged =
        null;
    };
  }, []);

  // ============================================================
  // GET AVAILABLE VOICES
  // ============================================================

  const getAvailableVoices =
    (): SpeechSynthesisVoice[] => {
      if (!("speechSynthesis" in window)) {
        return [];
      }

      return window.speechSynthesis.getVoices();
    };

  // ============================================================
  // FIND CORRECT LANGUAGE VOICE
  // ============================================================

  const findLanguageVoice = (
    targetLanguage: Language
  ): SpeechSynthesisVoice | null => {
    const voices =
      getAvailableVoices();

    const languageCode =
      targetLanguage === "Tamil"
        ? "ta-IN"
        : "en-IN";

    const baseLanguage =
      targetLanguage === "Tamil"
        ? "ta"
        : "en";

    console.log(
      `Searching for ${targetLanguage} voice...`
    );

    console.log(
      "Target language:",
      languageCode
    );

    // ========================================================
    // 1. EXACT MATCH
    // ========================================================

    const exactVoice =
      voices.find(
        (voice) =>
          voice.lang.toLowerCase() ===
          languageCode.toLowerCase()
      );

    if (exactVoice) {
      console.log(
        "EXACT VOICE FOUND:",
        exactVoice.name,
        exactVoice.lang
      );

      return exactVoice;
    }

    // ========================================================
    // 2. BASE LANGUAGE MATCH
    // ========================================================

    const baseVoice =
      voices.find(
        (voice) =>
          voice.lang
            .toLowerCase()
            .split("-")[0] ===
          baseLanguage
      );

    if (baseVoice) {
      console.log(
        "BASE LANGUAGE VOICE FOUND:",
        baseVoice.name,
        baseVoice.lang
      );

      return baseVoice;
    }

    // ========================================================
    // NO VOICE
    // ========================================================

    console.warn(
      `NO ${targetLanguage.toUpperCase()} VOICE FOUND`
    );

    return null;
  };

  // ============================================================
  // START / STOP MICROPHONE
  // ============================================================

  const toggleVoiceInput = () => {
    if (!speechSupported) {
      alert(
        language === "Tamil"
          ? "இந்த browser-ல் voice recognition ஆதரிக்கப்படவில்லை. Chrome பயன்படுத்தவும்."
          : "Voice recognition is not supported in this browser. Please use Google Chrome."
      );

      return;
    }

    if (!recognitionRef.current) {
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();

      setIsListening(false);

      return;
    }

    recognitionRef.current.lang =
      language === "Tamil"
        ? "ta-IN"
        : "en-IN";

    try {
      recognitionRef.current.start();

      setIsListening(true);
    } catch (error) {
      console.error(
        "Unable to start speech recognition:",
        error
      );
    }
  };

  // ============================================================
  // CLEAN MARKDOWN BEFORE SPEAKING
  // ============================================================

  const cleanTextForSpeech = (
    text: string
  ): string => {
    let cleaned = text;

    // ============================================================
    // REMOVE MARKDOWN
    // ============================================================

    cleaned = cleaned
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/^>\s*/gm, "")
      .replace(/^[-*+]\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "")
      .replace(
        /\[([^\]]+)\]\([^)]+\)/g,
        "$1"
      );

    // ============================================================
    // MEDICAL UNIT PRONUNCIATION
    // ============================================================

    if (language === "Tamil") {
      // Blood / CBC units

      cleaned = cleaned.replace(
        /\bmg\/dL\b/gi,
        "மில்லிகிராம் ஒரு டெசிலிட்டருக்கு"
      );

      cleaned = cleaned.replace(
        /\bg\/dL\b/gi,
        "கிராம் ஒரு டெசிலிட்டருக்கு"
      );

      cleaned = cleaned.replace(
        /\bmg\/L\b/gi,
        "மில்லிகிராம் ஒரு லிட்டருக்கு"
      );

      cleaned = cleaned.replace(
        /\bmmol\/L\b/gi,
        "மில்லிமோல் ஒரு லிட்டருக்கு"
      );

      // Volume units

      cleaned = cleaned.replace(
        /\bfL\b/gi,
        "ஃபெம்டோலிட்டர்"
      );

      cleaned = cleaned.replace(
        /\bpL\b/gi,
        "பிகோலிட்டர்"
      );

      cleaned = cleaned.replace(
        /\bmL\b/gi,
        "மில்லிலிட்டர்"
      );

      cleaned = cleaned.replace(
        /\bL\b/g,
        "லிட்டர்"
      );

      // Mass units

      cleaned = cleaned.replace(
        /\bpg\b/gi,
        "பிகோகிராம்"
      );

      cleaned = cleaned.replace(
        /\bng\b/gi,
        "நானோகிராம்"
      );

      cleaned = cleaned.replace(
        /\bmcg\b/gi,
        "மைக்ரோகிராம்"
      );

      // Cell count units

      cleaned = cleaned.replace(
        /\bthou\/mm3\b/gi,
        "ஆயிரம் ஒரு கன மில்லிமீட்டருக்கு"
      );

      cleaned = cleaned.replace(
        /\bthou\/mm³\b/gi,
        "ஆயிரம் ஒரு கன மில்லிமீட்டருக்கு"
      );

      cleaned = cleaned.replace(
        /\bmill\/mm3\b/gi,
        "மில்லியன் ஒரு கன மில்லிமீட்டருக்கு"
      );

      cleaned = cleaned.replace(
        /\bmill\/mm³\b/gi,
        "மில்லியன் ஒரு கன மில்லிமீட்டருக்கு"
      );

      // Temperature

      cleaned = cleaned.replace(
        /°C/gi,
        "டிகிரி செல்சியஸ்"
      );

      cleaned = cleaned.replace(
        /°F/gi,
        "டிகிரி ஃபாரன்ஹீட்"
      );

      // Percentage

      cleaned = cleaned.replace(
        /%/g,
        " சதவீதம்"
      );

      // Common medical abbreviations

      cleaned = cleaned.replace(
        /\bMCHC\b/g,
        "M C H C"
      );

      cleaned = cleaned.replace(
        /\bMCV\b/g,
        "M C V"
      );

      cleaned = cleaned.replace(
        /\bMCH\b/g,
        "M C H"
      );

      cleaned = cleaned.replace(
        /\bRBC\b/g,
        "R B C"
      );

      cleaned = cleaned.replace(
        /\bWBC\b/g,
        "W B C"
      );

      cleaned = cleaned.replace(
        /\bRDW\b/g,
        "R D W"
      );

      cleaned = cleaned.replace(
        /\bPCV\b/g,
        "P C V"
      );

      cleaned = cleaned.replace(
        /\bHb\b/g,
        "H B"
      );
    } else {
      // ========================================================
      // ENGLISH UNIT PRONUNCIATION
      // ========================================================

      cleaned = cleaned.replace(
        /\bmg\/dL\b/gi,
        "milligrams per deciliter"
      );

      cleaned = cleaned.replace(
        /\bg\/dL\b/gi,
        "grams per deciliter"
      );

      cleaned = cleaned.replace(
        /\bmg\/L\b/gi,
        "milligrams per liter"
      );

      cleaned = cleaned.replace(
        /\bmmol\/L\b/gi,
        "millimoles per liter"
      );

      cleaned = cleaned.replace(
        /\bfL\b/gi,
        "femtoliters"
      );

      cleaned = cleaned.replace(
        /\bpL\b/gi,
        "picoliters"
      );

      cleaned = cleaned.replace(
        /\bmL\b/gi,
        "milliliters"
      );

      cleaned = cleaned.replace(
        /\bpg\b/gi,
        "picograms"
      );

      cleaned = cleaned.replace(
        /\bng\b/gi,
        "nanograms"
      );

      cleaned = cleaned.replace(
        /\bmcg\b/gi,
        "micrograms"
      );

      cleaned = cleaned.replace(
        /\bthou\/mm3\b/gi,
        "thousand per cubic millimeter"
      );

      cleaned = cleaned.replace(
        /\bthou\/mm³\b/gi,
        "thousand per cubic millimeter"
      );

      cleaned = cleaned.replace(
        /\bmill\/mm3\b/gi,
        "million per cubic millimeter"
      );

      cleaned = cleaned.replace(
        /\bmill\/mm³\b/gi,
        "million per cubic millimeter"
      );

      cleaned = cleaned.replace(
        /%/g,
        " percent"
      );

      cleaned = cleaned.replace(
        /°C/gi,
        "degrees Celsius"
      );

      cleaned = cleaned.replace(
        /°F/gi,
        "degrees Fahrenheit"
      );
    }

    // ============================================================
    // FINAL CLEANUP
    // ============================================================

    cleaned = cleaned
      .replace(/\n+/g, ". ")
      .replace(/\s+/g, " ")
      .trim();

    return cleaned;
  };

  // ============================================================
  // STOP AI VOICE
  // ============================================================

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setSpeakingMessageIndex(null);
  };

  // ============================================================
  // SPEAK AI RESPONSE
  // ============================================================

  const speakText = (
    text: string,
    messageIndex: number
  ) => {
    if (!speechSynthesisSupported) {
      alert(
        language === "Tamil"
          ? "இந்த browser-ல் AI voice ஆதரிக்கப்படவில்லை."
          : "Text-to-speech is not supported in this browser."
      );

      return;
    }

    const speechText =
      cleanTextForSpeech(text);

    if (!speechText) {
      return;
    }

    // Stop previous speech

    window.speechSynthesis.cancel();

    setSpeakingMessageIndex(null);

    // ========================================================
    // GET VOICES
    // ========================================================

    const voices =
      getAvailableVoices();

    console.log(
      "Speaking language:",
      language
    );

    console.log(
      "Speech text:",
      speechText
    );

    // ========================================================
    // TAMIL
    // ========================================================

    if (language === "Tamil") {
      const tamilVoice =
        findLanguageVoice("Tamil");

      // NEVER FALL BACK TO ENGLISH

      if (!tamilVoice) {
        alert(
          "Tamil voice browser-ல் கிடைக்கவில்லை.\n\n" +
          "Chrome / Windows-ல் Tamil speech language pack install செய்யவும்.\n\n" +
          "Tamil voice இல்லாத நிலையில் English voice பயன்படுத்தப்படாது."
        );

        console.error(
          "Tamil TTS voice unavailable. Available voices:",
          voices.map(
            (voice) =>
              `${voice.name} (${voice.lang})`
          )
        );

        return;
      }

      const utterance =
        new SpeechSynthesisUtterance(
          speechText
        );

      utterance.lang = "ta-IN";

      utterance.voice =
        tamilVoice;

      utterance.rate = 0.9;

      utterance.pitch = 1;

      utterance.volume = 1;

      console.log(
        "USING TAMIL VOICE:",
        tamilVoice.name,
        tamilVoice.lang
      );

      utterance.onstart = () => {
        setSpeakingMessageIndex(
          messageIndex
        );
      };

      utterance.onend = () => {
        setSpeakingMessageIndex(null);
      };

      utterance.onerror = (event) => {
        console.error(
          "Tamil speech synthesis error:",
          event
        );

        setSpeakingMessageIndex(null);
      };

      setSpeakingMessageIndex(
        messageIndex
      );

      window.speechSynthesis.speak(
        utterance
      );

      return;
    }

    // ========================================================
    // ENGLISH
    // ========================================================

    const englishVoice =
      findLanguageVoice("English");

    const utterance =
      new SpeechSynthesisUtterance(
        speechText
      );

    utterance.lang = "en-IN";

    if (englishVoice) {
      utterance.voice =
        englishVoice;

      console.log(
        "USING ENGLISH VOICE:",
        englishVoice.name,
        englishVoice.lang
      );
    }

    utterance.rate = 0.95;

    utterance.pitch = 1;

    utterance.volume = 1;

    utterance.onstart = () => {
      setSpeakingMessageIndex(
        messageIndex
      );
    };

    utterance.onend = () => {
      setSpeakingMessageIndex(null);
    };

    utterance.onerror = (event) => {
      console.error(
        "English speech synthesis error:",
        event
      );

      setSpeakingMessageIndex(null);
    };

    setSpeakingMessageIndex(
      messageIndex
    );

    window.speechSynthesis.speak(
      utterance
    );
  };

  // ============================================================
  // SEND CHAT MESSAGE
  // ============================================================

  const sendMessage = async () => {
    const question =
      input.trim();

    if (!question || loading) {
      return;
    }

    stopSpeaking();

    const userMessage: Message = {
      sender: "user",
      text: question,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");

    setLoading(true);

    try {
      const token =
        localStorage.getItem("token");

      const response =
        await axios.post(
          "http://127.0.0.1:8000/chatbot/chat",
          {
            question: question,
            report: report,
            language: language,
          },
          {
            headers: token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {},
          }
        );

      const aiMessage: Message = {
        sender: "ai",
        text:
          response.data?.answer ||
          (
            language === "Tamil"
              ? "மன்னிக்கவும். தற்போது பதிலை உருவாக்க முடியவில்லை."
              : "Sorry, I couldn't generate an answer."
          ),
      };

      setMessages((previous) => {
        const newMessages = [
          ...previous,
          aiMessage,
        ];

        const newMessageIndex =
          newMessages.length - 1;

        // ====================================================
        // AUTO VOICE
        // ====================================================

        if (autoVoice) {
          setTimeout(() => {
            speakText(
              aiMessage.text,
              newMessageIndex
            );
          }, 300);
        }

        return newMessages;
      });
    } catch (error) {
      console.error(
        "Chatbot error:",
        error
      );

      const errorMessage: Message = {
        sender: "ai",
        text:
          language === "Tamil"
            ? "மன்னிக்கவும். AI சேவையுடன் இணைக்க முடியவில்லை. Backend இயங்குகிறதா என்பதை சரிபார்த்து மீண்டும் முயற்சிக்கவும்."
            : "Sorry, I couldn't connect to the AI service. Please make sure the backend is running and try again.",
      };

      setMessages((previous) => [
        ...previous,
        errorMessage,
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ENTER KEY
  // ============================================================

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  // ============================================================
  // CLEAR CHAT
  // ============================================================

  const clearChat = () => {
    stopSpeaking();

    setMessages([
      {
        sender: "ai",
        text:
          getWelcomeMessage(language),
      },
    ]);
  };

  // ============================================================
  // SUGGESTED QUESTION
  // ============================================================

  const selectSuggestedQuestion = (
    question: string
  ) => {
    setInput(question);
  };

  // ============================================================
  // TOGGLE AUTO VOICE
  // ============================================================

  const toggleAutoVoice = () => {
    if (!speechSynthesisSupported) {
      alert(
        language === "Tamil"
          ? "இந்த browser-ல் AI voice ஆதரிக்கப்படவில்லை."
          : "Text-to-speech is not supported in this browser."
      );

      return;
    }

    // When Tamil is selected,
    // verify Tamil voice before enabling Auto Voice.

    if (
      !autoVoice &&
      language === "Tamil"
    ) {
      const tamilVoice =
        findLanguageVoice("Tamil");

      if (!tamilVoice) {
        alert(
          "Tamil voice browser-ல் கிடைக்கவில்லை.\n\n" +
          "Tamil speech voice install செய்த பிறகு Auto Voice-ஐ enable செய்யவும்."
        );

        return;
      }
    }

    setAutoVoice((previous) => {
      const newValue =
        !previous;

      if (!newValue) {
        stopSpeaking();
      }

      return newValue;
    });
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header
        className="
          bg-white
          shadow
          flex
          items-center
          justify-between
          px-8
          py-4
        "
      >

        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate(-1)}
            className="
              bg-gray-100
              hover:bg-gray-200
              p-3
              rounded-xl
              text-gray-700
            "
            title="Go Back"
          >
            ←
          </button>

          <img
            src={logo}
            alt="MedVerse AI"
            className="h-12 w-12"
          />

          <div>

            <h1 className="text-2xl font-bold text-blue-700">
              MedVerse AI
            </h1>

            <p className="text-gray-500">
              {language === "Tamil"
                ? "AI மருத்துவ உதவியாளர்"
                : "AI Medical Assistant"}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          {/* LANGUAGE */}

          <div className="flex bg-gray-100 rounded-xl p-1">

            <button
              onClick={() =>
                setLanguage("English")
              }
              className={`
                px-4
                py-2
                rounded-lg
                font-semibold
                transition

                ${
                  language === "English"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-white"
                }
              `}
            >
              English
            </button>

            <button
              onClick={() =>
                setLanguage("Tamil")
              }
              className={`
                px-4
                py-2
                rounded-lg
                font-semibold
                transition

                ${
                  language === "Tamil"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-white"
                }
              `}
            >
              தமிழ்
            </button>

          </div>

          {/* AUTO VOICE */}

          <button
            onClick={toggleAutoVoice}
            className={`
              px-4
              py-2
              rounded-lg
              font-semibold
              transition

              ${
                autoVoice
                  ? "bg-purple-600 text-white"
                  : "bg-purple-50 text-purple-700 hover:bg-purple-100"
              }
            `}
            title="Toggle automatic AI voice"
          >
            {autoVoice
              ? "🔊 Auto Voice ON"
              : "🔇 Auto Voice OFF"}
          </button>

          {/* CLEAR */}

          <button
            onClick={clearChat}
            className="
              flex
              items-center
              gap-2
              bg-red-50
              text-red-600
              px-4
              py-2
              rounded-lg
              hover:bg-red-100
            "
          >
            🗑

            {language === "Tamil"
              ? "அழி"
              : "Clear"}
          </button>

          {/* DASHBOARD */}

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="
              text-blue-600
              font-semibold
            "
          >
            Dashboard
          </button>

        </div>

      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="max-w-5xl mx-auto p-6">

        {/* ====================================================
            REPORT INFO
        ==================================================== */}

        <div
          className="
            bg-white
            rounded-2xl
            shadow
            p-5
            mb-6
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              mb-4
            "
          >

            <div>

              <h2 className="text-xl font-bold text-gray-800">
                {language === "Tamil"
                  ? "மருத்துவ அறிக்கை உரையாடல்"
                  : "Medical Report Chat"}
              </h2>

              <p className="text-gray-500 mt-1">
                {language === "Tamil"
                  ? `${patientName} அவர்களின் அறிக்கை பற்றி கேள்விகள் கேட்கலாம்.`
                  : `Ask questions about ${patientName}'s uploaded report.`}
              </p>

            </div>

            <div
              className="
                bg-blue-50
                text-blue-700
                px-4
                py-2
                rounded-xl
                font-semibold
              "
            >
              {reportType}
            </div>

          </div>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-3
            "
          >

            <div
              className="
                bg-gray-50
                rounded-xl
                p-3
              "
            >

              <p className="text-sm text-gray-500">
                {language === "Tamil"
                  ? "நோயாளர்"
                  : "Patient"}
              </p>

              <p className="font-semibold text-gray-800">
                {patientName}
              </p>

            </div>

            <div
              className="
                bg-gray-50
                rounded-xl
                p-3
              "
            >

              <p className="text-sm text-gray-500">
                {language === "Tamil"
                  ? "அறிக்கை"
                  : "Report"}
              </p>

              <p className="font-semibold text-gray-800">
                {reportType}
              </p>

            </div>

            <div
              className="
                bg-gray-50
                rounded-xl
                p-3
              "
            >

              <p className="text-sm text-gray-500">
                {language === "Tamil"
                  ? "AI நிலை"
                  : "AI Status"}
              </p>

              <p className="font-semibold text-green-600">
                {language === "Tamil"
                  ? "அறிக்கை இணைக்கப்பட்டுள்ளது"
                  : "Report Connected"}
              </p>

            </div>

          </div>

        </div>

        {/* ====================================================
            SUGGESTED QUESTIONS
        ==================================================== */}

        <div
          className="
            bg-white
            rounded-2xl
            shadow
            p-5
            mb-6
          "
        >

          <h2 className="text-lg font-bold mb-3">
            {language === "Tamil"
              ? "பரிந்துரைக்கப்பட்ட கேள்விகள்"
              : "Suggested Questions"}
          </h2>

          <div className="flex flex-wrap gap-3">

            {suggestedQuestions.map(
              (question) => (
                <button
                  key={question}
                  onClick={() =>
                    selectSuggestedQuestion(
                      question
                    )
                  }
                  className="
                    bg-blue-50
                    text-blue-700
                    border
                    border-blue-100
                    px-4
                    py-2
                    rounded-xl
                    hover:bg-blue-100
                    transition
                  "
                >
                  {question}
                </button>
              )
            )}

          </div>

        </div>

        {/* ====================================================
            CHAT WINDOW
        ==================================================== */}

        <div
          className="
            bg-white
            rounded-2xl
            shadow
            overflow-hidden
          "
        >

          <div
            className="
              h-[500px]
              overflow-y-auto
              p-5
            "
          >

            {messages.map(
              (msg, index) => (
                <div
                  key={index}
                  className={`
                    flex
                    mb-5

                    ${
                      msg.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }
                  `}
                >

                  <div
                    className={`
                      max-w-2xl
                      rounded-2xl
                      px-5
                      py-4

                      ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }
                    `}
                  >

                    {/* MESSAGE HEADER */}

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        mb-3
                      "
                    >

                      <div
                        className={`
                          p-2
                          rounded-full

                          ${
                            msg.sender === "user"
                              ? "bg-blue-500"
                              : "bg-white"
                          }
                        `}
                      >
                        <span className="text-sm">
                          {msg.sender === "user"
                            ? "👤"
                            : "🤖"}
                        </span>
                      </div>

                      <strong>
                        {msg.sender === "user"
                          ? language === "Tamil"
                            ? "நீங்கள்"
                            : "You"
                          : "MedVerse AI"}
                      </strong>

                    </div>

                    {/* AI MESSAGE */}

                    {msg.sender === "ai" ? (
                      <>
                        <div
                          className="
                            prose
                            prose-sm
                            max-w-none
                          "
                        >
                          <ReactMarkdown>
                            {msg.text}
                          </ReactMarkdown>
                        </div>

                        {/* VOICE RESPONSE */}

                        <div
                          className="
                            mt-4
                            pt-3
                            border-t
                            border-gray-300
                          "
                        >

                          {speakingMessageIndex === index ? (
                            <button
                              onClick={
                                stopSpeaking
                              }
                              className="
                                bg-red-500
                                hover:bg-red-600
                                text-white
                                px-4
                                py-2
                                rounded-lg
                                text-sm
                                font-semibold
                                transition
                              "
                            >
                              ⏹{" "}

                              {language === "Tamil"
                                ? "நிறுத்து"
                                : "Stop Speaking"}
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                speakText(
                                  msg.text,
                                  index
                                )
                              }
                              disabled={
                                !speechSynthesisSupported
                              }
                              className="
                                bg-purple-600
                                hover:bg-purple-700
                                disabled:bg-gray-400
                                text-white
                                px-4
                                py-2
                                rounded-lg
                                text-sm
                                font-semibold
                                transition
                              "
                            >
                              🔊{" "}

                              {language === "Tamil"
                                ? "பதிலை கேளுங்கள்"
                                : "Read Answer"}
                            </button>
                          )}

                        </div>

                      </>
                    ) : (
                      <p className="whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    )}

                  </div>

                </div>
              )
            )}

            {/* ==================================================
                LOADING
            ================================================== */}

            {loading && (
              <div
                className="
                  flex
                  justify-start
                  mb-5
                "
              >

                <div
                  className="
                    bg-gray-100
                    rounded-2xl
                    px-5
                    py-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <span className="text-lg">
                      🤖
                    </span>

                    <span className="text-gray-600">
                      {language === "Tamil"
                        ? "MedVerse AI பதிலை உருவாக்குகிறது..."
                        : "MedVerse AI is thinking..."}
                    </span>

                  </div>

                  <div
                    className="
                      flex
                      gap-1
                      mt-3
                    "
                  >

                    <span
                      className="
                        w-2
                        h-2
                        bg-gray-400
                        rounded-full
                        animate-bounce
                      "
                    />

                    <span
                      className="
                        w-2
                        h-2
                        bg-gray-400
                        rounded-full
                        animate-bounce
                        [animation-delay:150ms]
                      "
                    />

                    <span
                      className="
                        w-2
                        h-2
                        bg-gray-400
                        rounded-full
                        animate-bounce
                        [animation-delay:300ms]
                      "
                    />

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* ==================================================
              INPUT AREA
          ================================================== */}

          <div
            className="
              border-t
              bg-gray-50
              p-4
            "
          >

            <div className="flex gap-3">

              {/* INPUT */}

              <input
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder={
                  language === "Tamil"
                    ? "உங்கள் மருத்துவ அறிக்கை பற்றி கேளுங்கள்..."
                    : "Ask about your medical report..."
                }
                disabled={loading}
                className="
                  flex-1
                  border
                  border-gray-300
                  rounded-xl
                  px-4
                  py-3
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  disabled:bg-gray-200
                "
              />

              {/* MICROPHONE */}

              <button
                onClick={
                  toggleVoiceInput
                }
                disabled={loading}
                title={
                  isListening
                    ? "Stop listening"
                    : "Start voice input"
                }
                className={`
                  px-5
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-xl
                  transition

                  ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }
                `}
              >
                {isListening
                  ? "⏹"
                  : "🎤"}
              </button>

              {/* SEND */}

              <button
                onClick={
                  sendMessage
                }
                disabled={
                  loading ||
                  !input.trim()
                }
                className="
                  bg-blue-600
                  hover:bg-blue-700
                  disabled:bg-gray-400
                  text-white
                  px-6
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-xl
                "
              >
                ➤
              </button>

            </div>

            {/* =================================================
                VOICE STATUS
            ================================================= */}

            <div className="text-center mt-2">

              {isListening ? (
                <p
                  className="
                    text-sm
                    text-red-600
                    font-medium
                  "
                >
                  🎤{" "}

                  {language === "Tamil"
                    ? "கேட்கிறது... பேசுங்கள்"
                    : "Listening... Speak now"}
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  {speechSupported
                    ? language === "Tamil"
                      ? "🎤 தமிழில் பேச microphone-ஐ அழுத்தவும்"
                      : "🎤 Press the microphone to speak"
                    : language === "Tamil"
                      ? "இந்த browser-ல் voice recognition ஆதரிக்கப்படவில்லை"
                      : "Voice recognition is not supported in this browser"}
                </p>
              )}

            </div>

            {/* =================================================
                AUTO VOICE STATUS
            ================================================= */}

            <div className="text-center mt-2">

              <p
                className={`
                  text-xs
                  font-medium

                  ${
                    autoVoice
                      ? "text-purple-600"
                      : "text-gray-500"
                  }
                `}
              >
                {autoVoice
                  ? language === "Tamil"
                    ? "🔊 AI பதில்கள் தானாக பேசப்படும்"
                    : "🔊 AI answers will be spoken automatically"
                  : language === "Tamil"
                    ? "🔇 Auto Voice முடக்கப்பட்டுள்ளது"
                    : "🔇 Auto Voice is off"}
              </p>

            </div>

            {/* =================================================
                DISCLAIMER
            ================================================= */}

            <p
              className="
                text-xs
                text-gray-500
                mt-2
                text-center
              "
            >
              {language === "Tamil"
                ? "MedVerse AI பொதுவான தகவல்களை வழங்குகிறது. இது மருத்துவரின் ஆலோசனைக்கு மாற்றாகாது."
                : "MedVerse AI provides general information and does not replace professional medical advice."}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Chat;