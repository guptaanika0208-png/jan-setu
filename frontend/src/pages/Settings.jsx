import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaGlobe, FaAdjust, FaVolumeUp, FaShieldAlt, FaHistory, FaSignOutAlt, FaChevronRight } from "react-icons/fa";
import AppShell from "../components/AppShell";
import TopBar from "../components/TopBar";
import { Card } from "../components/ui";
import LanguageSelector from "../components/LanguageSelector";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { t } = useTranslation();
  const { currentLanguage, highContrast, setHighContrast } = useLanguage();
  const { logout } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const [screenReading, setScreenReading] = useState(false);
  const [cyberScore] = useState(82); // demo score derived from: 2FA on, strong password, no suspicious logins

  return (
    <AppShell showVoiceFab={false}>
      <TopBar title={t("settings.title")} showBack />
      <div className="px-5 space-y-5">
        <Section title={t("common.language")}>
          <Row icon={FaGlobe} label={currentLanguage.nativeName} onClick={() => setLangOpen(true)} />
        </Section>

        <Section title={t("settings.accessibility")}>
          <ToggleRow icon={FaAdjust} label={t("settings.highContrast")} value={highContrast} onChange={setHighContrast} />
          <ToggleRow icon={FaVolumeUp} label={t("settings.screenReading")} value={screenReading} onChange={setScreenReading} />
        </Section>

        <Section title="Cybersecurity">
          <Card className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-setu-ink">{t("settings.cyberHealthScore")}</p>
              <span className="font-display font-bold text-setu-success text-lg">{cyberScore}/100</span>
            </div>
            <div className="h-2 w-full bg-setu-blue-light rounded-pill overflow-hidden">
              <div className="h-full bg-setu-success rounded-pill" style={{ width: `${cyberScore}%` }} />
            </div>
            <p className="text-xs text-setu-slate mt-2">
              Based on password strength, verified phone, and no suspicious login activity.
            </p>
          </Card>
          <Row icon={FaShieldAlt} label={t("settings.privacyDashboard")} />
          <Row icon={FaHistory} label={t("settings.auditLog")} />
        </Section>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-setu-error font-semibold text-sm py-3.5"
        >
          <FaSignOutAlt />
          {t("settings.logout")}
        </button>
      </div>
      <LanguageSelector open={langOpen} onClose={() => setLangOpen(false)} />
    </AppShell>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="font-display font-semibold text-sm text-setu-slate mb-2 px-1">{title}</h2>
      {children}
    </div>
  );
}

function Row({ icon: Icon, label, onClick }) {
  return (
    <Card onClick={onClick} className="mb-3 flex items-center gap-3">
      <div className="h-9 w-9 rounded-2xl bg-setu-blue-light flex items-center justify-center text-setu-blue">
        <Icon size={14} />
      </div>
      <span className="flex-1 text-sm font-medium text-setu-ink">{label}</span>
      <FaChevronRight className="text-setu-slate text-xs" />
    </Card>
  );
}

function ToggleRow({ icon: Icon, label, value, onChange }) {
  return (
    <Card className="mb-3 flex items-center gap-3">
      <div className="h-9 w-9 rounded-2xl bg-setu-blue-light flex items-center justify-center text-setu-blue">
        <Icon size={14} />
      </div>
      <span className="flex-1 text-sm font-medium text-setu-ink">{label}</span>
      <button
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        aria-label={label}
        className={`h-7 w-12 rounded-pill flex items-center px-0.5 transition-colors ${value ? "bg-setu-blue justify-end" : "bg-setu-blue-light justify-start"}`}
      >
        <span className="h-6 w-6 rounded-full bg-white shadow" />
      </button>
    </Card>
  );
}
