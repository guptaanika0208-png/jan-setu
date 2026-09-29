import { useTranslation } from "react-i18next";
import {
  FaGraduationCap,
  FaHeartbeat,
  FaTractor,
  FaHome,
  FaPiggyBank,
  FaTools,
  FaWheelchair,
  FaBuilding,
} from "react-icons/fa";
import AppShell from "../components/AppShell";
import TopBar from "../components/TopBar";
import ServiceTile from "../components/ServiceTile";

const SERVICES = [
  { key: "epfo", icon: FaBuilding, color: "#0B4F9E" },
  { key: "scholarships", icon: FaGraduationCap, color: "#0B4F9E" },
  { key: "healthInsurance", icon: FaHeartbeat, color: "#C1272D" },
  { key: "pension", icon: FaPiggyBank, color: "#B8860B" },
  { key: "housing", icon: FaHome, color: "#F0A202" },
  { key: "agriculture", icon: FaTractor, color: "#1B8354" },
  { key: "skillDevelopment", icon: FaTools, color: "#0B4F9E" },
  { key: "disabilitySupport", icon: FaWheelchair, color: "#5B6B85" },
];

export default function Services() {
  const { t } = useTranslation();
  return (
    <AppShell>
      <TopBar title={t("services.title")} />
      <div className="px-5">
        <div className="grid grid-cols-3 gap-3">
          {SERVICES.map(({ key, icon, color }) => (
            <ServiceTile key={key} icon={icon} label={t(`services.${key}`)} to="/schemes" color={color} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
