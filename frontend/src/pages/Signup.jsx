import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import SetuMark from "../components/SetuMark";
import { PrimaryButton, TextField } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ full_name: "", phone_number: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form);
      navigate("/otp-verification", { state: { phone_number: form.phone_number, purpose: "signup" } });
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create account. Try again.");
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
        <h1 className="font-display font-bold text-2xl text-setu-ink text-center">{t("auth.signupTitle")}</h1>
        <p className="text-setu-slate text-sm text-center mt-1 mb-8">{t("auth.signupSubtitle")}</p>

        <form onSubmit={handleSubmit}>
          <TextField label={t("auth.fullName")} value={form.full_name} onChange={update("full_name")} required />
          <TextField
            label={t("auth.phoneNumber")}
            type="tel"
            inputMode="numeric"
            value={form.phone_number}
            onChange={update("phone_number")}
            placeholder="98765 43210"
            required
          />
          <TextField label={t("auth.email")} type="email" value={form.email} onChange={update("email")} />
          <TextField
            label={t("auth.password")}
            type="password"
            value={form.password}
            onChange={update("password")}
            minLength={8}
            required
          />
          {error && <p className="text-setu-error text-sm mb-4">{error}</p>}
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? t("common.loading") : t("auth.signup")}
          </PrimaryButton>
        </form>

        <p className="text-center text-sm text-setu-slate mt-6">
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="text-setu-blue font-semibold">
            {t("auth.loginInstead")}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
