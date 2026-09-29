import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaSearch,
  FaMicrophone,
  FaGraduationCap,
  FaHeartbeat,
  FaTractor,
  FaHome as FaHomeIcon,
  FaBell,
  FaFileAlt,
  FaChevronRight,
} from "react-icons/fa";
import AppShell from "../components/AppShell";
import { Card, Badge } from "../components/ui";
import ServiceTile from "../components/ServiceTile";
import SchemeCard from "../components/SchemeCard";
import { ProgressBar } from "../components/ProgressBar";
import { useAuth } from "../context/AuthContext";
import { schemesApi, applicationsApi, notificationsApi, profileApi } from "../services/api";

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [suggested, setSuggested] = useState([]);

  useEffect(() => {
    schemesApi.list().then(({ data }) => setSchemes(data.slice(0, 4))).catch(() => {});
    applicationsApi.list().then(({ data }) => setApplications(data.slice(0, 3))).catch(() => {});
    notificationsApi.list().then(({ data }) => setNotifications(data.slice(0, 3))).catch(() => {});
    profileApi.get().then(({ data }) => setProfile(data)).catch(() => {});
    schemesApi
      .eligibility()
      .then(({ data }) => setSuggested(data.eligible.slice(0, 3)))
      .catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AppShell>
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-setu-slate text-sm">{t("home.greeting")},</p>
            <h1 className="font-display font-bold text-xl text-setu-ink">{user?.full_name?.split(" ")[0] || "Citizen"}</h1>
          </div>
          <button
            onClick={() => navigate("/notifications")}
            className="h-11 w-11 rounded-full bg-white shadow-card flex items-center justify-center text-setu-blue relative"
            aria-label={t("home.notifications")}
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-setu-marigold text-white text-[10px] flex items-center justify-center font-semibold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Search + voice */}
        <div className="flex items-center gap-2 bg-white rounded-pill shadow-card px-4 py-3 mb-3">
          <FaSearch className="text-setu-slate shrink-0" />
          <input
            className="flex-1 outline-none text-sm text-setu-ink placeholder:text-setu-slate bg-transparent"
            placeholder={t("home.searchPlaceholder")}
            onFocus={() => navigate("/schemes")}
          />
        </div>
        <button
          onClick={() => navigate("/voice-assistant")}
          className="w-full flex items-center gap-3 bg-setu-blue text-white rounded-2xl px-4 py-3.5 mb-6 shadow-card"
        >
          <span className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center">
            <FaMicrophone />
          </span>
          <span className="text-sm font-medium">{t("home.askAssistant")}</span>
        </button>

        {/* Profile completeness */}
        {profile && !profile.is_complete && (
          <Card onClick={() => navigate("/profile")} className="mb-6 border border-setu-marigold/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-setu-ink">{t("profile.completeness")}</p>
              <FaChevronRight className="text-setu-slate text-xs" />
            </div>
            <ProgressBar value={65} />
            <p className="text-xs text-setu-slate mt-2">{t("schemes.completeProfilePrompt")}</p>
          </Card>
        )}

        {/* Quick actions */}
        <SectionHeader title={t("home.quickActions")} />
        <div className="grid grid-cols-4 gap-3 mb-6">
          <ServiceTile icon={FaGraduationCap} label={t("services.scholarships")} to="/services" color="#0B4F9E" />
          <ServiceTile icon={FaHeartbeat} label={t("services.healthInsurance")} to="/services" color="#C1272D" />
          <ServiceTile icon={FaTractor} label={t("services.agriculture")} to="/services" color="#1B8354" />
          <ServiceTile icon={FaHomeIcon} label={t("services.housing")} to="/services" color="#F0A202" />
        </div>

        {/* Suggested schemes */}
        {suggested.length > 0 && (
          <>
            <SectionHeader title={t("home.suggestedSchemes")} onSeeAll={() => navigate("/eligible-schemes")} />
            <div className="mb-6">
              {suggested.map((r) => (
                <SchemeCard key={r.scheme.id} result={r} showStatus />
              ))}
            </div>
          </>
        )}

        {/* Government schemes */}
        <SectionHeader title={t("home.govtSchemes")} onSeeAll={() => navigate("/schemes")} />
        <div className="mb-6">
          {schemes.map((s) => (
            <SchemeCard key={s.id} scheme={s} />
          ))}
        </div>

        {/* Recent applications */}
        {applications.length > 0 && (
          <>
            <SectionHeader title={t("home.recentApplications")} onSeeAll={() => navigate("/application-progress")} />
            <div className="mb-6">
              {applications.map((a) => (
                <Card key={a.id} onClick={() => navigate("/application-progress")} className="mb-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-setu-blue-light flex items-center justify-center text-setu-blue">
                    <FaFileAlt />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-setu-ink">Application #{a.id.slice(0, 8)}</p>
                    <Badge tone={a.status === "submitted" ? "success" : "warning"}>{t(`applications.${a.status === "under_review" ? "underReview" : a.status}`)}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function SectionHeader({ title, onSeeAll }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-display font-semibold text-setu-ink">{title}</h2>
      {onSeeAll && (
        <button onClick={onSeeAll} className="text-xs font-semibold text-setu-blue">
          {t("common.seeAll")}
        </button>
      )}
    </div>
  );
}
