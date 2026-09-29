import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaTimes, FaGlobe } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageSelector({ open, onClose }) {
  const { t } = useTranslation();
  const { languageCode, setLanguageCode, languages } = useLanguage();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[75vh] flex flex-col mx-auto max-w-md"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-setu-blue-light">
              <div className="flex items-center gap-2">
                <FaGlobe className="text-setu-blue" />
                <h2 className="font-display font-semibold text-lg">{t("common.language")}</h2>
              </div>
              <button onClick={onClose} aria-label="Close" className="text-setu-slate">
                <FaTimes />
              </button>
            </div>
            <div className="overflow-y-auto px-3 py-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguageCode(lang.code);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-3.5 rounded-2xl hover:bg-setu-blue-light/60 text-left"
                >
                  <div>
                    <p className="font-medium text-setu-ink">{lang.nativeName}</p>
                    <p className="text-xs text-setu-slate">
                      {lang.name}
                      {!lang.translated && ` · ${t("common.comingSoon")}`}
                    </p>
                  </div>
                  {languageCode === lang.code && <FaCheck className="text-setu-blue" />}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
