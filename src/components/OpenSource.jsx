import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faChevronLeft, faChevronRight, faCodeBranch, faCodePullRequest } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import Loader from "./common/Loader";
import ErrorMessage from "./common/ErrorMessage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const OpenSourceCard = ({ item, techColors, isArabic }) => {
  const getTechStyle = (techName) => {
    const found = techColors.find(c => c.name.toLowerCase() === techName.toLowerCase());
    if (found) {
      return { backgroundColor: found.bgColor, color: found.textColor };
    }
    return { backgroundColor: "#6b7280", color: "#ffffff" }; // Default gray
  };

  return (
    <article className="group bg-card overflow-hidden border border-border hover:border-primary transition-colors duration-150 flex flex-col">
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors inline-block flex-1">
            {isArabic ? (item.title_ar || item.title) : item.title}
          </h3>
          <span className={`px-3 py-1 text-xs font-bold rounded-full ml-2 ${
            item.status === 'Merged' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            item.status === 'Closed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}>
            {isArabic && item.status === 'Merged' ? 'مدمج' : 
             isArabic && item.status === 'Closed' ? 'مغلق' : 
             isArabic && item.status === 'Open' ? 'مفتوح' : 
             item.status}
          </span>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-1">
          {isArabic ? (item.description_ar || item.description) : item.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {item.technologies && item.technologies.map((tech, index) => (
            <span
              key={index}
              className="inline-block rounded-full py-1 px-3 text-xs font-medium shadow-sm"
              style={getTechStyle(tech)}
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex gap-3 mt-auto pt-4 border-t border-border/50">
          {item.prUrl && (
            <a
              href={item.prUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 border border-border text-primary hover:bg-primary hover:text-white hover:border-primary py-2.5 px-4 text-sm font-semibold transition-colors"
            >
              <FontAwesomeIcon icon={faCodePullRequest} /> {isArabic ? "طلب السحب" : "View PR"}
            </a>
          )}
          <a
            href={item.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-black dark:bg-slate-700 text-white py-2.5 px-4 text-sm font-semibold hover:bg-primary transition-colors"
          >
            <FontAwesomeIcon icon={faGithub} /> {isArabic ? "المستودع" : "Repository"}
          </a>
        </div>
      </div>
    </article>
  );
};

const failoverContributions = [
  {
    id: "failover-1",
    title: "nestjs-zod · TypeScript · 1k+ stars · PR #377",
    title_ar: "nestjs-zod · TypeScript · 1k+ stars · PR #377",
    description: "Fixed a bug in cleanupOpenApiDoc where nested $refs were not rewritten after schema renaming, causing Swagger UI resolver errors for array responses and union schemas. Introduced a recursive rewriteRefs helper that traverses the full OpenAPI schema tree and rewrites stale $ref values regardless of nesting depth. Added a regression test covering the exact failing scenario (@ZodResponse({ type: [Dto] }) with meta({ id })).",
    description_ar: "إصلاح خطأ في cleanupOpenApiDoc حيث لم تتم إعادة كتابة مراجع $refs المتداخلة، مما تسبب في أخطاء في واجهة Swagger UI.",
    repoUrl: "https://github.com/risenforces/nestjs-zod",
    prUrl: "https://github.com/risenforces/nestjs-zod/pull/377",
    status: "Open",
    technologies: ["TypeScript", "Node.js"]
  },
  {
    id: "failover-2",
    title: "rowboat · TypeScript · 4.3k+ stars · PR #545",
    title_ar: "rowboat · TypeScript · 4.3k+ stars · PR #545",
    description: "Fixed a critical crash where long conversations exceeded the model's context window limit, causing the API to return a hard 400 bad_request_error surfaced directly to the user with no recovery. Implemented a truncateMessagesToFit() utility in context-utils.ts called inside streamLlm() — the single send-to-AI-SDK callsite — preserving system messages, dropping oldest non-system messages first, and enforcing tool-call/tool-result pairing integrity. Applied a conservative heuristic token counter (⌈chars / 4⌉) with an 80 k-token default budget, covering all supported models (Claude 3.x, GPT-4o, Gemini 1.5, Llama 3) while leaving headroom for system prompt and output.",
    description_ar: "إصلاح عطل حرج حيث تتجاوز المحادثات الطويلة حد نافذة سياق النموذج. تم تنفيذ أداة truncateMessagesToFit() للحفاظ على رسائل النظام وإسقاط أقدم الرسائل أولاً مع الحفاظ على اقتران استدعاء الأدوات.",
    repoUrl: "https://github.com/rowboatlabs/rowboat",
    prUrl: "https://github.com/rowboatlabs/rowboat/pull/545",
    status: "Open",
    technologies: ["TypeScript", "AI"]
  }
];

const OpenSource = () => {
  const { isArabic } = useLanguage();
  const [items, setItems] = useState([]);
  const [techColors, setTechColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 3;

  const fetchTechColors = async () => {
    try {
      const response = await fetch(`${API_URL}/colorschemas`);
      if (response.ok) {
        const data = await response.json();
        setTechColors(data);
      }
    } catch (err) {
      console.error("Error fetching tech colors:", err);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/opensources?limit=${limit}&page=${page}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch open source contributions");
      }
      
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setItems(data);
      } else {
        setItems(failoverContributions);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching contributions, using failover data:", err);
      setItems(failoverContributions);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechColors();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [page]);

  if (!loading && !error && items.length === 0 && page === 1) {
    return null; // Hide the section if there are no open source contributions
  }

  return (
    <>
      <div className="mb-12 ms-4 md:ms-24 ">
        <h2
          className="text-primary text-xs font-bold uppercase tracking-wide mb-4 flex items-center gap-3 before:content-[''] before:w-8 before:h-[1px] before:bg-primary/30"
          id="opensource"
        >
          {isArabic ? "مساهمات في المجتمع" : "Community Contributions"}
        </h2>
        <h3 className="text-4xl font-extrabold text-text leading-tight">
          {isArabic ? (<>مفتوح <span className="text-primary">المصدر</span></>) : (<>Open <span className="text-primary">Source</span></>)}
        </h3>
      </div>

      <section 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 ms-4 md:ms-24 min-h-[300px]"
        aria-labelledby="opensource"
      >
        {loading ? (
          <div className="col-span-full py-10">
            <Loader message={isArabic ? "جاري تحميل المساهمات..." : "Fetching contributions..."} />
          </div>
        ) : error ? (
          <div className="col-span-full py-10">
            <ErrorMessage 
              message={error} 
              onRetry={() => fetchItems()} 
            />
          </div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <OpenSourceCard key={item._id || item.id} item={item} techColors={techColors} isArabic={isArabic} />
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-gray-500 bg-secondary/10 border border-dashed border-border">
            <p className="font-bold text-lg mb-2">{isArabic ? "لا توجد مساهمات" : "No Contributions Found"}</p>
          </div>
        )}
      </section>

      {(items.length > 0 || page > 1) && (
        <div className="flex flex-col items-center gap-6 mb-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
              }}
              disabled={page === 1 || loading}
              className="w-12 h-12 border border-border flex items-center justify-center text-text hover:bg-primary hover:border-primary hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed group"
              title="Previous Page"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">{isArabic ? "صفحة" : "Page"}</span>
              <span className="text-2xl font-black text-primary min-w-[1.5ch] text-center">{page}</span>
            </div>

            <button
              onClick={() => {
                setPage((p) => p + 1);
                document.getElementById('opensource')?.scrollIntoView({ behavior: 'smooth' });
              }}
              disabled={items.length < limit || loading}
              className="w-12 h-12 border border-border flex items-center justify-center text-text hover:bg-primary hover:border-primary hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed group"
              title="Next Page"
            >
              <FontAwesomeIcon icon={faChevronRight} className="group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OpenSource;
