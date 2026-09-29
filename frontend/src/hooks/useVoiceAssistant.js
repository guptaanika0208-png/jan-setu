import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { voiceApi } from "../services/api";
import { useVoiceAssistantContext } from "../context/VoiceAssistantContext";
import { useLanguage } from "../context/LanguageContext";

/**
 * Browser-native Speech-to-Text (webkitSpeechRecognition / SpeechRecognition)
 * + Text-to-Speech (speechSynthesis), wired to the backend's /api/voice/command
 * intent-detection endpoint for navigation + spoken responses.
 *
 * Usage: const { isListening, isThinking, startListening, speak } = useVoiceAssistant();
 */
const SpeechRecognitionAPI =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const BCP47_BY_APP_LANG = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  pa: "pa-IN",
  ur: "ur-IN",
};

export function useVoiceAssistant() {
  const navigate = useNavigate();
  const { pushMessage } = useVoiceAssistantContext();
  const { languageCode } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSupported] = useState(!!SpeechRecognitionAPI);
  const recognitionRef = useRef(null);

  const speak = useCallback(
    (text) => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = BCP47_BY_APP_LANG[languageCode] || "en-IN";
      utterance.rate = 0.98;
      window.speechSynthesis.speak(utterance);
    },
    [languageCode]
  );

  const handleTranscript = useCallback(
    async (transcript) => {
      pushMessage("user", transcript);
      setIsThinking(true);
      try {
        const { data } = await voiceApi.command(transcript);
        pushMessage("assistant", data.speak);
        speak(data.speak);
        if (data.route) {
          setTimeout(() => navigate(data.route), 400);
        }
      } catch (err) {
        const fallback = "Sorry, I could not process that. Please try again.";
        pushMessage("assistant", fallback);
        speak(fallback);
      } finally {
        setIsThinking(false);
      }
    },
    [navigate, pushMessage, speak]
  );

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      pushMessage("assistant", "Voice input isn't supported in this browser. Try Chrome on Android or desktop.");
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = BCP47_BY_APP_LANG[languageCode] || "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleTranscript(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [languageCode, handleTranscript, pushMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // For text-based fallback (typed command, or manual testing without mic)
  const sendTextCommand = useCallback((text) => handleTranscript(text), [handleTranscript]);

  return { isListening, isThinking, isSupported, startListening, stopListening, speak, sendTextCommand };
}
