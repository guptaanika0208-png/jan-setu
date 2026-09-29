import * as Icons from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, Badge } from "./ui";

const STATUS_TONE = { eligible: "success", possibly_eligible: "warning", not_eligible: "error" };

export default function SchemeCard({ result, scheme, showStatus = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const data = scheme || result?.scheme;
  const Icon = Icons[data.icon] || Icons.FaLandmark;

  return (
    <Card onClick={() => navigate(`/schemes/${data.id}`)} className="mb-3">
      <div className="flex gap-3">
        <div className="h-12 w-12 rounded-2xl bg-setu-blue-light flex items-center justify-center text-setu-blue text-xl shrink-0">
          <Icon />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-setu-ink text-sm leading-snug">{data.name}</h3>
          </div>
          <p className="text-xs text-setu-slate mt-1 line-clamp-2">{data.short_description}</p>
          {showStatus && result && (
            <div className="mt-2">
              <Badge tone={STATUS_TONE[result.status]}>{t(`schemes.${toCamel(result.status)}`)}</Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function toCamel(status) {
  return status.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
