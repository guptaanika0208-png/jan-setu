import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import SetuMark from "../components/SetuMark";
import { PrimaryButton } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/api";

export default function OTPVerification() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithOtp } = useAuth();

  const phone = location.state?.phone_number || "";
  const purpose = location.state?.purpose || "signup";

  const [digits, setDigits] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!phone) navigate("/login", { replace: true });
  }, [phone, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithOtp(phone, digits.join(""), purpose);
      navigate(purpose === "signup" ? "/profile" : "/home");
    } catch (err) {
      setError(err.response?.data?.detail || "Incorrect OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const { data } = await authApi.requestOtp({ phone_number: phone, purpose });
    if (data.demo_otp) setDemoOtp(data.demo_otp);
  };

  return (
    <div className="min-h-screen bg-setu-bg flex flex-col justify-center px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <SetuMark className="h-14 w-14" />
        </div>
        <h1 className="font-display font-bold text-2xl text-setu-ink text-center">{t("auth.otpTitle")}</h1>
        <p className="text-setu-slate text-sm text-center mt-1 mb-8">
          {t("auth.otpSubtitle")} +91 {phone}
        </p>

        <div className="flex justify-between gap-2 mb-6">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              maxLength={1}
              inputMode="numeric"
              className="h-14 w-12 text-center text-xl font-semibold rounded-2xl border border-setu-blue-light focus:border-setu-blue outline-none"
            />
          ))}
        </div>

        {demoOtp && (
          <p className="text-center text-xs text-setu-marigold mb-4">Demo mode - your OTP is {demoOtp}</p>
        )}
        {error && <p className="text-setu-error text-sm text-center mb-4">{error}</p>}

        <PrimaryButton onClick={handleVerify} disabled={loading || digits.some((d) => !d)}>
          {loading ? t("common.loading") : t("auth.verifyOtp")}
        </PrimaryButton>

        <button onClick={handleResend} className="w-full text-center text-sm text-setu-blue font-semibold mt-5">
          {t("auth.resendOtp")}
        </button>
      </motion.div>
    </div>
  );
}
