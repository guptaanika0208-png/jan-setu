import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus, FaShieldAlt } from "react-icons/fa";
import AppShell from "../components/AppShell";
import TopBar from "../components/TopBar";
import { DocumentCard } from "../components/DocumentAndNotification";
import { documentsApi } from "../services/api";

const DOC_TYPES = ["aadhaar", "pan", "passport", "income_certificate", "caste_certificate", "disability_certificate"];

export default function MyDocuments() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [uploadType, setUploadType] = useState(DOC_TYPES[0]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = () => documentsApi.list().then(({ data }) => setDocuments(data)).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await documentsApi.upload(uploadType, file);
      await load();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <AppShell showVoiceFab={false}>
      <TopBar title={t("documents.title")} />
      <div className="px-5">
        <div className="flex items-center gap-2 bg-setu-blue-light rounded-2xl px-4 py-3 mb-5 text-setu-blue text-xs">
          <FaShieldAlt />
          {t("documents.encryptedNote")}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
          {DOC_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setUploadType(type)}
              className={`shrink-0 px-3.5 py-2 rounded-pill text-xs font-semibold ${
                uploadType === type ? "bg-setu-blue text-white" : "bg-white text-setu-slate shadow-card"
              }`}
            >
              {t(`documents.${toCamel(type)}`)}
            </button>
          ))}
        </div>

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" onChange={handleFileSelect} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-setu-blue/40 text-setu-blue rounded-card py-6 mb-6 font-semibold text-sm disabled:opacity-50"
        >
          <FaPlus />
          {uploading ? t("common.loading") : t("documents.uploadNew")}
        </button>

        {documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
        {documents.length === 0 && <p className="text-center text-setu-slate text-sm mt-6">No documents uploaded yet.</p>}
      </div>
    </AppShell>
  );
}

function toCamel(type) {
  return type.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
