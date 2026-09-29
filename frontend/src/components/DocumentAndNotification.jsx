import { FaFileAlt, FaCheckCircle, FaClock, FaTimesCircle, FaExclamationCircle, FaCalendarAlt, FaShieldAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Card, Badge } from "./ui";

const STATUS_CONFIG = {
  verified: { tone: "success", Icon: FaCheckCircle },
  pending: { tone: "warning", Icon: FaClock },
  rejected: { tone: "error", Icon: FaTimesCircle },
};

export function DocumentCard({ document }) {
  const { t } = useTranslation();
  const { tone, Icon } = STATUS_CONFIG[document.verification_status] || STATUS_CONFIG.pending;

  return (
    <Card className="mb-3 flex items-center gap-3">
      <div className="h-11 w-11 rounded-2xl bg-setu-blue-light flex items-center justify-center text-setu-blue">
        <FaFileAlt />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-setu-ink text-sm truncate">{document.file_name}</p>
        <p className="text-xs text-setu-slate">{t(`documents.${document.doc_type}`, document.doc_type)}</p>
      </div>
      <Badge tone={tone}>
        <Icon className="mr-1 inline" size={10} />
        {t(`documents.${document.verification_status}`)}
      </Badge>
    </Card>
  );
}

const NOTIFICATION_ICON = {
  deadline: FaCalendarAlt,
  expiry: FaExclamationCircle,
  application_update: FaCheckCircle,
  security: FaShieldAlt,
};

export function NotificationItem({ notification, onRead }) {
  const Icon = NOTIFICATION_ICON[notification.type] || FaExclamationCircle;
  return (
    <Card onClick={() => onRead?.(notification.id)} className={`mb-3 ${notification.is_read ? "opacity-60" : ""}`}>
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-2xl bg-setu-blue-light flex items-center justify-center text-setu-blue shrink-0">
          <Icon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-setu-ink text-sm">{notification.title}</p>
          <p className="text-xs text-setu-slate mt-0.5">{notification.message}</p>
        </div>
        {!notification.is_read && <span className="h-2 w-2 rounded-full bg-setu-marigold mt-1.5 shrink-0" />}
      </div>
    </Card>
  );
}
