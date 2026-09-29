import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaFileAlt, FaCheckCircle } from "react-icons/fa";
import AppShell from "../components/AppShell";
import TopBar from "../components/TopBar";
import { Card, Badge, PrimaryButton, SecondaryButton } from "../components/ui";
import { StepIndicator } from "../components/ProgressBar";
import { applicationsApi, schemesApi } from "../services/api";

const STATUS_TONE = { draft: "warning", submitted: "blue", under_review: "warning", approved: "success", rejected: "error" };

export default function ApplicationProgress() {
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [schemesById, setSchemesById] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    applicationsApi.list().then(async ({ data }) => {
      setApplications(data);
      const entries = await Promise.all(
        data.map(async (a) => {
          try {
            const { data: scheme } = await schemesApi.detail(a.scheme_id);
            return [a.scheme_id, scheme];
          } catch {
            return [a.scheme_id, null];
          }
        })
      );
      setSchemesById(Object.fromEntries(entries));
    });
  }, []);

  const activeApp = applications.find((a) => a.id === activeId);

  const handleAdvance = async () => {
    if (!activeApp) return;
    const nextStep = activeApp.current_step + 1;
    if (nextStep >= activeApp.total_steps) {
      setConfirming(true);
      return;
    }
    await applicationsApi.autosave(activeApp.id, { current_step: nextStep, draft_data: {} });
    setApplications((apps) => apps.map((a) => (a.id === activeApp.id ? { ...a, current_step: nextStep } : a)));
  };

  const handleSubmit = async () => {
    await applicationsApi.submit(activeApp.id, { draft_data: activeApp.draft_data });
    setApplications((apps) => apps.map((a) => (a.id === activeApp.id ? { ...a, status: "submitted" } : a)));
    setConfirming(false);
    setActiveId(null);
  };

  if (activeApp) {
    const scheme = schemesById[activeApp.scheme_id];
    return (
      <AppShell showVoiceFab={false}>
        <TopBar title={scheme?.name || t("applications.title")} showBack onBellClick={() => setActiveId(null)} rightSlot={null} />
        <div className="px-5">
          <p className="text-xs text-setu-slate mb-2">
            {t("applications.step")} {activeApp.current_step + 1} {t("applications.of")} {activeApp.total_steps}
          </p>
          <StepIndicator current={activeApp.current_step} total={activeApp.total_steps} />

          <Card className="my-5">
            <p className="text-xs font-semibold text-setu-blue mb-2">{t("applications.autoFilled")}</p>
            <dl className="space-y-2 text-sm">
              {Object.entries(activeApp.draft_data || {})
                .filter(([, v]) => v !== null && v !== undefined && v !== "")
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="text-setu-slate capitalize">{key.replace(/_/g, " ")}</dt>
                    <dd className="text-setu-ink font-medium">{String(value)}</dd>
                  </div>
                ))}
            </dl>
          </Card>

          {confirming ? (
            <>
              <p className="text-sm text-setu-slate mb-4">{t("applications.confirmSubmit")}</p>
              <PrimaryButton onClick={handleSubmit} className="mb-3">
                {t("common.submit")}
              </PrimaryButton>
              <SecondaryButton onClick={() => setConfirming(false)}>{t("common.cancel")}</SecondaryButton>
            </>
          ) : (
            <PrimaryButton onClick={handleAdvance}>{t("common.continue")}</PrimaryButton>
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar title={t("applications.title")} showBack />
      <div className="px-5">
        {applications.map((app) => {
          const scheme = schemesById[app.scheme_id];
          return (
            <Card key={app.id} className="mb-3" onClick={() => app.status === "draft" && setActiveId(app.id)}>
              <div className="flex gap-3">
                <div className="h-11 w-11 rounded-2xl bg-setu-blue-light flex items-center justify-center text-setu-blue shrink-0">
                  {app.status === "submitted" ? <FaCheckCircle /> : <FaFileAlt />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-setu-ink truncate">{scheme?.name || "Loading..."}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge tone={STATUS_TONE[app.status] || "blue"}>
                      {t(`applications.${toCamel(app.status)}`)}
                    </Badge>
                    {app.status === "draft" && (
                      <span className="text-xs text-setu-blue font-semibold">{t("applications.resumeApplication")}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {applications.length === 0 && <p className="text-center text-setu-slate text-sm mt-10">No applications yet.</p>}
      </div>
    </AppShell>
  );
}

function toCamel(status) {
  return status.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
