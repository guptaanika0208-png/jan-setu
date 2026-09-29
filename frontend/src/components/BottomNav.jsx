import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaHome, FaThLarge, FaLandmark, FaFolderOpen, FaUser } from "react-icons/fa";

const NAV_ITEMS = [
  { to: "/home", key: "home", Icon: FaHome },
  { to: "/services", key: "services", Icon: FaThLarge },
  { to: "/schemes", key: "schemes", Icon: FaLandmark },
  { to: "/documents", key: "documents", Icon: FaFolderOpen },
  { to: "/profile", key: "profile", Icon: FaUser },
];

export default function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-setu-blue-light px-2 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="mx-auto max-w-md flex justify-between">
        {NAV_ITEMS.map(({ to, key, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                isActive ? "text-setu-blue" : "text-setu-slate"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`text-lg ${isActive ? "scale-110" : ""} transition-transform`} />
                <span>{t(`nav.${key}`)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
