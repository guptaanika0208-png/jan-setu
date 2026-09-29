import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as Icons from "react-icons/fa";
import AppShell from "../components/AppShell";
import TopBar from "../components/TopBar";
import { Card, PrimaryButton, Badge } from "../components/ui";
import { schemesApi, applicationsApi } from "../services/api";

export default function SchemeDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    schemesApi.detail(id).then(({ data }) => setScheme(data)).catch(() => {});
  }, [id]);

  if (!scheme) {
    return (
      <AppShell>
        <TopBar title="" showBack />
        <p className="text-center text-setu-slate mt-10">{t("common.loading")}</p>
      </AppShell>
    );
  }

  const Icon = Icons[scheme.icon] || Icons.FaLandmark;

  const handleApply = async () => {
    setApplying(true);
    try {
      const { data } = await applicationsApi.create(scheme.id);
      navigate(`/application-progress?applicationId=${data.id}`);
    } catch {
      setApplying(false);
    }
  };

  return (
    <AppShell showVoiceFab={false}>
      <TopBar title={t("schemes.viewDetails")} showBack />
      <div className="px-5">
        <Card className="mb-4 text-center py-8">
          <div className="h-16 w-16 rounded-3xl bg-setu-blue-light flex items-center justify-center text-setu-blue text-2xl mx-auto mb-4">
            <Icon />
          </div>
          <h1 className="font-display font-bold text-lg text-setu-ink">{scheme.name}</h1>
          <p className="text-xs text-setu-slate mt-1">{scheme.department}</p>
        </Card>

        <Section title={t("schemes.benefits")}>{scheme.benefits}</Section>
        <Section title="Description">{scheme.full_description}</Section>

        <Section title={t("schemes.requiredDocuments")}>
          <div className="flex flex-wrap gap-2 mt-1">
            {scheme.required_documents.map((doc) => (
              <Badge key={doc}>{doc.replace(/_/g, " ")}</Badge>
            ))}
          </div>
        </Section>

        {scheme.application_deadline && (
          <Section title={t("schemes.deadline")}>{scheme.application_deadline}</Section>
        )}

        <div className="mt-6 space-y-3">
          <PrimaryButton onClick={handleApply} disabled={applying}>
            {applying ? t("common.loading") : t("schemes.apply")}
          </PrimaryButton>
          {scheme.official_link && (
            <a
              href={scheme.official_link}
              target="_blank"
              rel="noreferrer"
              className="block text-center text-sm text-setu-blue font-semibold py-2"
            >
              Visit official portal
            </a>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <h3 className="font-display font-semibold text-sm text-setu-ink mb-1.5">{title}</h3>
      <p className="text-sm text-setu-slate leading-relaxed">{children}</p>
    </div>
  );
}
