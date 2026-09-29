import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaQuestionCircle, FaHeadset, FaMicrophone, FaChevronDown } from "react-icons/fa";
import AppShell from "../components/AppShell";
import TopBar from "../components/TopBar";
import { Card } from "../components/ui";

const FAQS = [
  { q: "How does Jan Setu find schemes for me?", a: "Once you complete your profile, our eligibility engine compares your details against every scheme's requirements and shows you exactly why you qualify." },
  { q: "Is my data safe?", a: "Yes. Sensitive details like your Aadhaar number and income are encrypted at rest, all traffic is served over HTTPS, and every login is logged in your audit trail." },
  { q: "What happens if my internet disconnects mid-application?", a: "Your progress is auto-saved after every step. Simply reopen the application and continue exactly where you left off." },
  { q: "Can I use Jan Setu in my own language?", a: "Yes, tap the language icon in Settings or the Voice Assistant to switch between all 22 scheduled Indian languages and English." },
];

export default function Help() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <AppShell showVoiceFab={false}>
      <TopBar title={t("help.title")} showBack />
      <div className="px-5">
        <button
          onClick={() => navigate("/voice-assistant")}
          className="w-full flex items-center gap-3 bg-setu-blue text-white rounded-2xl px-4 py-3.5 mb-6 shadow-card"
        >
          <span className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center">
            <FaMicrophone />
          </span>
          <span className="text-sm font-medium text-left">{t("help.voiceGuide")}</span>
        </button>

        <h2 className="font-display font-semibold text-setu-ink mb-3 flex items-center gap-2">
          <FaQuestionCircle className="text-setu-blue" />
          {t("help.faqs")}
        </h2>
        {FAQS.map((faq, i) => (
          <Card key={faq.q} className="mb-3" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-setu-ink pr-3">{faq.q}</p>
              <FaChevronDown className={`text-setu-slate text-xs shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
            </div>
            {openIndex === i && <p className="text-xs text-setu-slate mt-2 leading-relaxed">{faq.a}</p>}
          </Card>
        ))}

        <h2 className="font-display font-semibold text-setu-ink mb-3 mt-6 flex items-center gap-2">
          <FaHeadset className="text-setu-blue" />
          {t("help.contactSupport")}
        </h2>
        <Card className="mb-6">
          <p className="text-sm text-setu-ink font-medium">Toll-free helpline</p>
          <p className="text-setu-blue font-semibold text-lg">1800-11-JANSETU</p>
          <p className="text-xs text-setu-slate mt-1">Available Monday-Saturday, 9 AM - 6 PM</p>
        </Card>
      </div>
    </AppShell>
  );
}
