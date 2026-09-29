import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FaMicrophone, FaLanguage } from "react-icons/fa";
import TopBar from "../components/TopBar";
import { useVoiceAssistant } from "../hooks/useVoiceAssistant";
import { useVoiceAssistantContext } from "../context/VoiceAssistantContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "../components/LanguageSelector";
import { useState } from "react";

export default function VoiceAssistant() {
  const { t } = useTranslation();
  const { isListening, isThinking, isSupported, startListening, sendTextCommand } = useVoiceAssistant();
  const { transcriptHistory } = useVoiceAssistantContext();
  const { currentLanguage } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [transcriptHistory]);

  const SAMPLES = [t("voice.sample1"), t("voice.sample2"), t("voice.sample3")];

  return (
    <div className="min-h-screen bg-setu-blue-dark flex flex-col">
      <div className="mx-auto w-full max-w-md flex flex-col min-h-screen">
        <div className="px-2 pt-2">
          <TopBar
            title={t("voice.title")}
            showBack
            dark
            rightSlot={
              <button
                onClick={() => setLangOpen(true)}
                className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white"
                aria-label={t("common.language")}
              >
                <FaLanguage />
              </button>
            }
          />
        </div>

        {/* Conversation transcript */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {transcriptHistory.length === 0 && (
            <div className="text-center mt-8">
              <p className="text-white/70 text-sm mb-4">{t("voice.tryAsking")}</p>
              <div className="space-y-2">
                {SAMPLES.map((sample) => (
                  <button
                    key={sample}
                    onClick={() => sendTextCommand(sample)}
                    className="block w-full text-left bg-white/10 text-white text-sm rounded-2xl px-4 py-3"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>
          )}
          {transcriptHistory.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user" ? "ml-auto bg-setu-marigold text-white" : "bg-white/10 text-white"
              }`}
            >
              {msg.text}
            </motion.div>
          ))}
          {isThinking && (
            <div className="bg-white/10 text-white/70 text-sm rounded-2xl px-4 py-2.5 w-fit">{t("voice.thinking")}</div>
          )}
        </div>

        {/* Mic button */}
        <div className="px-5 pb-10 pt-4 flex flex-col items-center">
          <p className="text-white/60 text-xs mb-4">
            {isListening ? t("voice.listening") : `${currentLanguage.nativeName} · ${t("voice.tapToSpeak")}`}
          </p>
          <div className="relative flex items-center justify-center">
            <AnimatePresence>
              {isListening && (
                <motion.span
                  className="absolute h-24 w-24 rounded-full bg-setu-marigold/40"
                  initial={{ scale: 0.8, opacity: 0.6 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                />
              )}
            </AnimatePresence>
            <motion.button
              onClick={startListening}
              whileTap={{ scale: 0.92 }}
              className={`relative h-20 w-20 rounded-full flex items-center justify-center text-2xl text-white shadow-fab ${
                isListening ? "bg-setu-marigold" : "bg-white/15"
              }`}
              aria-label={t("voice.tapToSpeak")}
            >
              <FaMicrophone />
            </motion.button>
          </div>
          {!isSupported && (
            <p className="text-white/50 text-xs mt-4 text-center px-6">
              Voice input isn't supported in this browser. Try typing a command below.
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typedText.trim()) {
                sendTextCommand(typedText.trim());
                setTypedText("");
              }
            }}
            className="w-full mt-6"
          >
            <input
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder="Or type a command..."
              className="w-full rounded-pill bg-white/10 text-white placeholder:text-white/40 px-4 py-3 text-sm outline-none"
            />
          </form>
        </div>
      </div>
      <LanguageSelector open={langOpen} onClose={() => setLangOpen(false)} />
    </div>
  );
}
