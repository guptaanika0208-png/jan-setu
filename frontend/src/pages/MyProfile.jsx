import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaCog, FaFolderOpen } from "react-icons/fa";
import AppShell from "../components/AppShell";
import TopBar from "../components/TopBar";
import { Card, PrimaryButton, TextField, SelectField } from "../components/ui";
import { ProgressBar } from "../components/ProgressBar";
import { useAuth } from "../context/AuthContext";
import { profileApi } from "../services/api";

const EMPTY_FORM = {
  age: "",
  gender: "",
  state: "",
  district: "",
  occupation: "",
  annual_income: "",
  aadhaar_number: "",
  category: "",
  education_level: "",
  disability_status: false,
  disability_type: "",
};

export default function MyProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    profileApi
      .get()
      .then(({ data }) => {
        if (data) setForm((f) => ({ ...f, ...data, annual_income: data.annual_income ?? "" }));
      })
      .catch(() => {});
  }, []);

  const update = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const filledCount = Object.entries(form).filter(([k, v]) => k !== "disability_type" && v !== "" && v !== false).length;
  const completeness = Math.min(100, Math.round((filledCount / 9) * 100));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : null,
        annual_income: form.annual_income ? Number(form.annual_income) : null,
      };
      await profileApi.upsert(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <TopBar
        title={t("profile.title")}
        rightSlot={
          <button onClick={() => navigate("/settings")} className="h-10 w-10 rounded-full bg-white shadow-card flex items-center justify-center text-setu-blue">
            <FaCog />
          </button>
        }
      />
      <div className="px-5">
        <Card className="mb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-14 w-14 rounded-full bg-setu-blue text-white flex items-center justify-center font-display font-bold text-lg">
              {user?.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-display font-semibold text-setu-ink">{user?.full_name}</p>
              <p className="text-xs text-setu-slate">+91 {user?.phone_number}</p>
            </div>
          </div>
          <p className="text-xs text-setu-slate mb-1.5">{t("profile.completeness")} · {completeness}%</p>
          <ProgressBar value={completeness} />
        </Card>

        <Card className="mb-5" onClick={() => navigate("/documents")}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-setu-blue-light flex items-center justify-center text-setu-blue">
              <FaFolderOpen />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-setu-ink">{t("profile.documents")}</p>
              <p className="text-xs text-setu-slate">{t("documents.encryptedNote")}</p>
            </div>
          </div>
        </Card>

        <h2 className="font-display font-semibold text-setu-ink mb-3">{t("profile.personalDetails")}</h2>
        <form onSubmit={handleSave}>
          <TextField label={t("profile.age")} type="number" min="0" max="120" value={form.age} onChange={update("age")} />
          <SelectField label={t("profile.gender")} value={form.gender} onChange={update("gender")}>
            <option value="">{t("common.optional")}</option>
            <option value="male">{t("profile.male")}</option>
            <option value="female">{t("profile.female")}</option>
            <option value="other">{t("profile.other")}</option>
          </SelectField>
          <TextField label={t("profile.state")} value={form.state} onChange={update("state")} />
          <TextField label={t("profile.district")} value={form.district} onChange={update("district")} />
          <TextField label={t("profile.occupation")} value={form.occupation} onChange={update("occupation")} placeholder="student, farmer, trader..." />
          <TextField label={t("profile.income")} type="number" min="0" value={form.annual_income} onChange={update("annual_income")} />
          <TextField
            label="Aadhaar Number"
            value={form.aadhaar_number}
            onChange={update("aadhaar_number")}
            maxLength={12}
            placeholder="12-digit Aadhaar (encrypted at rest)"
          />
          <SelectField label={t("profile.category")} value={form.category} onChange={update("category")}>
            <option value="">{t("common.optional")}</option>
            <option value="general">General</option>
            <option value="obc">OBC</option>
            <option value="sc">SC</option>
            <option value="st">ST</option>
            <option value="ews">EWS</option>
          </SelectField>
          <TextField label={t("profile.education")} value={form.education_level} onChange={update("education_level")} />

          <label className="flex items-center gap-3 mb-4">
            <input type="checkbox" checked={form.disability_status} onChange={update("disability_status")} className="h-5 w-5 accent-setu-blue" />
            <span className="text-sm text-setu-ink">{t("profile.disability")}</span>
          </label>
          {form.disability_status && (
            <TextField label={t("profile.disabilityType")} value={form.disability_type} onChange={update("disability_type")} />
          )}

          {saved && <p className="text-setu-success text-sm mb-4">Profile saved successfully.</p>}
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? t("common.loading") : t("profile.saveProfile")}
          </PrimaryButton>
        </form>

        <button onClick={logout} className="w-full text-center text-sm text-setu-error font-semibold mt-6 mb-2">
          {t("settings.logout")}
        </button>
      </div>
    </AppShell>
  );
}
