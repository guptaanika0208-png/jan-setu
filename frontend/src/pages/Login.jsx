import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FaLock } from "react-icons/fa";
import SetuMark from "../components/SetuMark";
import { PrimaryButton, TextField } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(phone, password);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-setu-bg flex flex-col justify-center px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <SetuMark className="h-14 w-14" />
        </div>
        <h1 className="font-display font-bold text-2xl text-setu-ink text-center">{t("auth.loginTitle")}</h1>
        <p className="text-setu-slate text-sm text-center mt-1 mb-8">{t("auth.loginSubtitle")}</p>

        <form onSubmit={handleSubmit}>
          <TextField
            label={t("auth.phoneNumber")}
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98765 43210"
            required
          />
          <TextField
            label={t("auth.password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          {error && <p className="text-setu-error text-sm mb-4">{error}</p>}
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? t("common.loading") : t("auth.login")}
          </PrimaryButton>
        </form>

        <p className="text-center text-sm text-setu-slate mt-6">
          {t("auth.noAccount")}{" "}
          <Link to="/signup" className="text-setu-blue font-semibold">
            {t("auth.createOne")}
          </Link>
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-setu-slate mt-8">
          <FaLock className="text-setu-blue" />
          {t("auth.secureNote")}
        </div>
      </motion.div>
    </div>
  );
}
