import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaSearch } from "react-icons/fa";
import AppShell from "../components/AppShell";
import TopBar from "../components/TopBar";
import SchemeCard from "../components/SchemeCard";
import { schemesApi } from "../services/api";

const CATEGORIES = ["education", "health", "employment", "agriculture", "housing", "pension", "women", "disability"];

export default function GovernmentSchemes() {
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState([]);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    schemesApi.list().then(({ data }) => setSchemes(data)).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return schemes.filter((s) => {
      const matchesQuery = s.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !activeCategory || s.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [schemes, query, activeCategory]);

  return (
    <AppShell>
      <TopBar title={t("schemes.title")} />
      <div className="px-5">
        <div className="flex items-center gap-2 bg-white rounded-pill shadow-card px-4 py-3 mb-4">
          <FaSearch className="text-setu-slate shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 outline-none text-sm bg-transparent"
            placeholder={t("common.search")}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
          <CategoryChip label={t("common.seeAll")} active={!activeCategory} onClick={() => setActiveCategory(null)} />
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat[0].toUpperCase() + cat.slice(1)}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>

        {filtered.map((s) => (
          <SchemeCard key={s.id} scheme={s} />
        ))}
        {filtered.length === 0 && <p className="text-center text-setu-slate text-sm mt-10">No schemes found.</p>}
      </div>
    </AppShell>
  );
}

function CategoryChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-pill text-xs font-semibold whitespace-nowrap ${
        active ? "bg-setu-blue text-white" : "bg-white text-setu-slate shadow-card"
      }`}
    >
      {label}
    </button>
  );
}
