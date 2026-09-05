import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCodePullRequest } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const statusLabels = {
  Merged: { en: "Merged", ar: "مدمج" },
  Open: { en: "Open", ar: "مفتوح" },
  Closed: { en: "Closed", ar: "مغلق" },
};

const statusStyle = (status) => {
  if (status === "Merged") {
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  }
  if (status === "Closed") {
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  }
  return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
};

const getProjectName = (repoUrl) => {
  try {
    const { pathname } = new URL(repoUrl);
    return pathname.replace(/^\/|\/$/g, "");
  } catch {
    return repoUrl;
  }
};

const getPrLabel = (prUrl) => {
  const match = prUrl?.match(/\/pull\/(\d+)/);
  return match ? `PR #${match[1]}` : null;
};

const OpenSourceCard = ({ item, isArabic }) => {
  const statusText = statusLabels[item.status]
    ? isArabic
      ? statusLabels[item.status].ar
      : statusLabels[item.status].en
    : item.status;
  const prLabel = getPrLabel(item.prUrl);
  const linkUrl = item.prUrl || item.repoUrl;
  const description = isArabic
    ? item.description_ar || item.description
    : item.description;

  return (
    <article className="group bg-card overflow-hidden border border-border hover:border-primary transition-colors duration-150 flex flex-col">
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start gap-3 mb-3">
          <span className="text-sm font-bold text-primary uppercase tracking-wide">
            {getProjectName(item.repoUrl)}
          </span>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${statusStyle(
              item.status
            )}`}
          >
            {statusText}
          </span>
        </div>

        {prLabel && (
          <div className="mb-3">
            <span className="inline-block text-xs font-mono font-semibold text-gray-500 dark:text-gray-400 bg-secondary/20 rounded px-2 py-1">
              {prLabel}
            </span>
          </div>
        )}

        <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors mb-3">
          {isArabic ? item.title_ar || item.title : item.title}
        </h3>

        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-1 leading-relaxed">
          {description}
        </p>

        <a
          href={linkUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-black dark:bg-slate-700 text-white py-2.5 px-4 text-sm font-semibold hover:bg-primary transition-colors mt-auto"
        >
          <FontAwesomeIcon icon={faCodePullRequest} /> {isArabic ? "عرض طلب السحب" : "View PR"}
        </a>
      </div>
    </article>
  );
};

const OpenSource = () => {
  const { isArabic } = useLanguage();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContributions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/opensources`);
        if (!response.ok) throw new Error("Failed to fetch contributions");
        const data = await response.json();
        setContributions(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center md:text-start">
      <div className="mb-12 ms-4 md:ms-0">
        <h2
          className="text-primary text-xs font-bold uppercase tracking-wide mb-4 flex items-center gap-3 before:content-[''] before:w-8 before:h-px before:bg-primary/30"
          id="opensource"
        >
          {isArabic ? "مساهمات في المجتمع" : "Community Contributions"}
        </h2>
        <h3 className="text-4xl font-extrabold text-text leading-tight">
          {isArabic ? (
            <>
              مساهمات <span className="text-primary">مفتوحة المصدر</span>
            </>
          ) : (
            <>
              Open Source <span className="text-primary">Contributions</span>
            </>
          )}
        </h3>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">
            {isArabic ? "جاري تحميل المساهمات..." : "Loading contributions..."}
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-error bg-error/10 border border-error/20">
          <p className="font-bold mb-2">
            {isArabic ? "خطأ في تحميل المساهمات" : "Error loading contributions"}
          </p>
          <p>{error}</p>
        </div>
      ) : contributions.length === 0 ? (
        <div className="text-center py-20 bg-secondary/10 border border-dashed border-border flex flex-col items-center">
          <p className="text-gray-500 font-medium">
            {isArabic ? "لا توجد مساهمات." : "No contributions found."}
          </p>
        </div>
      ) : (
        <section
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 mb-16"
          aria-labelledby="opensource"
        >
          {contributions.map((item) => (
            <OpenSourceCard key={item._id || item.id} item={item} isArabic={isArabic} />
          ))}
        </section>
      )}
      </div>
    </div>
  );
};

export default OpenSource;
