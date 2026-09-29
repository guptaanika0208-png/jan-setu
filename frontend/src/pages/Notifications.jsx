import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaBellSlash } from "react-icons/fa";
import AppShell from "../components/AppShell";
import TopBar from "../components/TopBar";
import { NotificationItem } from "../components/DocumentAndNotification";
import { notificationsApi } from "../services/api";

export default function Notifications() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);

  const load = () => notificationsApi.list().then(({ data }) => setNotifications(data)).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    await notificationsApi.markRead(id);
    load();
  };

  return (
    <AppShell showVoiceFab={false}>
      <TopBar title={t("notifications.title")} showBack />
      <div className="px-5">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onRead={markRead} />
        ))}
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-16 text-setu-slate">
            <FaBellSlash className="text-3xl mb-3" />
            <p className="text-sm">{t("notifications.empty")}</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
