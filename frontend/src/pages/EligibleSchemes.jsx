import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppShell from "../components/AppShell";
import TopBar from "../components/TopBar";
import SchemeCard from "../components/SchemeCard";
import { Card } from "../components/ui";
import { schemesApi } from "../services/api";

export default function EligibleSchemes() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("eligible");

  useEffect(() => {
    schemesApi
      .eligibility()
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.detail || "Could not load eligibility."));
  }, []);

  return (
    <AppShell>
      <TopBar title={t("schemes.eligibleTitle")} showBack />
      <div className="px-5">
        {error && (
          <Card className="text-center py-8">
            <p className="text-sm text-setu-slate mb-4">{error}</p>
            <button onClick={() => navigate("/profile")} className="text-setu-blue font-semibold text-sm">
              {t("profile.title")} →
            </button>
          </Card>
        )}

        {data && (
          <>
            <div className="flex gap-2 mb-4">
              {["eligible", "possibly_eligible", "not_eligible"].map((key) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 py-2.5 rounded-pill text-xs font-semibold ${
                    tab === key ? "bg-setu-blue text-white" : "bg-white text-setu-slate shadow-card"
                  }`}
                >
                  {t(`schemes.${toCamel(key)}`)} ({data[key]?.length ?? 0})
                </button>
              ))}
            </div>

            {(data[tab] || []).map((result) => (
              <div key={result.scheme.id} className="mb-4">
                <SchemeCard result={result} showStatus />
                {result.reasons.length > 0 && (
                  <Card className="mt-[-8px] rounded-t-none pt-3 bg-setu-blue-light/40 shadow-none">
                    <p className="text-xs font-semibold text-setu-ink mb-1">{t("schemes.whyEligible")}</p>
                    <ul className="text-xs text-setu-slate space-y-0.5 list-disc list-inside">
                      {result.reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            ))}
            {(data[tab] || []).length === 0 && (
              <p className="text-center text-setu-slate text-sm mt-10">No schemes in this category yet.</p>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

function toCamel(status) {
  return status.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
