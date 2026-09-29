import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SetuMark from "../components/SetuMark";
import { useAuth } from "../context/AuthContext";

export default function Splash() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => navigate(user ? "/home" : "/login", { replace: true }), 1800);
    return () => clearTimeout(timer);
  }, [isLoading, user, navigate]);

  return (
    <div className="min-h-screen bg-setu-blue flex flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white rounded-3xl p-6 shadow-2xl"
      >
        <SetuMark className="h-20 w-20" strokeColor="#0B4F9E" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="font-display font-bold text-3xl text-white mt-6"
      >
        Jan Setu
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-setu-blue-light mt-2 font-medium"
      >
        One Secure Profile. Every Government Benefit.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-12 flex items-center gap-2 text-setu-blue-light text-sm"
      >
        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
        {t("splash.loading")}
      </motion.div>
    </div>
  );
}
