import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faLocationDot,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const formatDate = (dateStr, isArabic) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(isArabic ? "ar" : "en-US", {
    year: "numeric",
    month: "short",
  });
};

const ExperienceCard = ({ item, isArabic }) => {
  const role = isArabic ? item.role_ar || item.role : item.role;
  const location = isArabic ? item.location_ar || item.location : item.location;
  const description = isArabic ? item.description_ar || item.description : item.description;
  const dateRange = `${formatDate(item.startDate, isArabic)} — ${
    item.current ? (isArabic ? "الحالي" : "Present") : formatDate(item.endDate, isArabic)
  }`;

  return (
    <article className="relative ps-10 pb-10 last:pb-0 border-s-2 border-border">
      <span className="absolute -start-[9px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-secondary" />

      <div className="bg-card border border-border hover:border-primary transition-colors duration-150 p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="text-lg font-bold text-text">{role}</h3>
            <p className="text-primary font-bold text-sm">
              {item.companyUrl ? (
                <a href={item.companyUrl} target="_blank" rel="noreferrer" className="hover:underline">
                  {item.company}
                </a>
              ) : (
                item.company
              )}
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-gray-500 dark:text-gray-400 bg-secondary/20 rounded px-2 py-1 whitespace-nowrap">
            {dateRange}
          </span>
        </div>

        {location && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faLocationDot} /> {location}
          </p>
        )}

        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed">
          {description}
        </p>

        {item.technologies?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-block rounded-full py-1 px-3 text-xs font-medium bg-secondary/20 text-gray-600 dark:text-gray-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

const Experience = () => {
  const { isArabic } = useLanguage();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 3;

  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/experiences?limit=${limit}&page=${page}`);
        if (!response.ok) throw new Error("Failed to fetch experiences");
        const data = await response.json();
        setExperiences(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [page]);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center md:text-start">
        <div className="mb-12 ms-4 md:ms-0">
          <h2
            className="text-primary text-xs font-bold uppercase tracking-wide mb-4 flex items-center gap-3 before:content-[''] before:w-8 before:h-px before:bg-primary/30"
            id="experience"
          >
            {isArabic ? "المسيرة المهنية" : "Career Path"}
          </h2>
          <h3 className="text-4xl font-extrabold text-text leading-tight">
            {isArabic ? (
              <>
                الخبرة <span className="text-primary">العملية</span>
              </>
            ) : (
              <>
                Work <span className="text-primary">Experience</span>
              </>
            )}
          </h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">
              {isArabic ? "جاري تحميل الخبرات..." : "Loading experience..."}
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-error bg-error/10 border border-error/20">
            <p className="font-bold mb-2">
              {isArabic ? "خطأ في تحميل الخبرات" : "Error loading experience"}
            </p>
            <p>{error}</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-20 bg-secondary/10 border border-dashed border-border flex flex-col items-center">
            <FontAwesomeIcon icon={faBriefcase} className="text-3xl text-gray-400 mb-4" />
            <p className="text-gray-500 font-medium">
              {isArabic ? "لا توجد خبرات مضافة." : "No experience found."}
            </p>
          </div>
        ) : (
          <>
            <section aria-labelledby="experience" className="max-w-3xl">
              {experiences.map((item) => (
                <ExperienceCard key={item._id || item.id} item={item} isArabic={isArabic} />
              ))}
            </section>

            <div className="flex flex-col items-center gap-4 pt-4">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="w-10 h-10 border border-border flex items-center justify-center text-text hover:bg-primary hover:border-primary hover:text-white disabled:opacity-30 transition-colors group"
                >
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    className="group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5 transition-transform rtl:rotate-180"
                  />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    {isArabic ? "صفحة" : "Page"}
                  </span>
                  <span className="text-xl font-black text-primary">
                    {page}
                  </span>
                </div>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={experiences.length < limit || loading}
                  className="w-10 h-10 border border-border flex items-center justify-center text-text hover:bg-primary hover:border-primary hover:text-white disabled:opacity-30 transition-colors group"
                >
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform rtl:rotate-180"
                  />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Experience;
