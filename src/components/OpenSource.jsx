import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCodePullRequest } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../context/LanguageContext";

const contributions = [
  {
    id: "nestjs-zod-439",
    project: "nestjs-zod",
    prUrl: "https://github.com/BenLorantfy/nestjs-zod/pull/439",
    prLabel: "PR #439",
    status: "Open",
    title: "Fixed TypeScript node10 moduleResolution compatibility issue",
    description:
      "Addressed issue #431 by re-exporting isZodDto from the main entrypoint, resolving a TypeScript module resolution conflict under the node10 moduleResolution strategy and ensuring proper type resolution for consumers of the library.",
  },
  {
    id: "nestjs-zod-377",
    project: "nestjs-zod",
    prUrl: "https://github.com/BenLorantfy/nestjs-zod/pull/377",
    prLabel: "PR #377",
    status: "Merged",
    title: "Fixed recursive $ref rewriting in cleanupOpenApiDoc",
    description:
      "Identified and fixed a bug in the cleanupOpenApiDoc utility where nested $refs in OpenAPI schemas were not being rewritten after schema renaming, causing Swagger UI resolver errors for array and union schemas. Introduced a recursive rewriteRefs() helper and added a regression test.",
  },
  {
    id: "rowboat-545",
    project: "rowboat",
    prUrl: "https://github.com/rowboatlabs/rowboat/pull/545",
    prLabel: "PR #545",
    status: "Merged",
    title: "Implemented truncateMessagesToFit() for context window overflow handling",
    description:
      "Fixed a crash where long conversations exceeded the model context window, causing a hard 400 bad_request_error with no recovery path. Implemented truncateMessagesToFit() in context-utils.ts, preserving system messages, dropping oldest non-system messages first, enforcing tool-call and tool-result pairing, and using a token-budget heuristic.",
  },
  {
    id: "oca-web-api-144",
    project: "OCA/web-api",
    prUrl: "https://github.com/OCA/web-api/pull/144",
    prLabel: "PR #144",
    status: "Open",
    title: "Fixed webservice adapter bug",
    description:
      "Fixed a webservice adapter defaulting content_only to True, which returned raw bytes instead of the expected requests.Response object. Also fixed a related inconsistency in the OAuth2 backend adapter, added a deprecation warning for backward compatibility, and wrote three unit tests covering all cases.",
  },
];

const statusLabels = {
  Merged: { en: "Merged", ar: "مدمج" },
  Open: { en: "Open", ar: "مفتوح" },
  "Open (under review)": { en: "Open (under review)", ar: "مفتوح (قيد المراجعة)" },
};

const statusStyle = (status) => {
  if (status.startsWith("Merged")) {
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  }
  return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
};

const OpenSourceCard = ({ item, isArabic }) => {
  const statusText = statusLabels[item.status]
    ? isArabic
      ? statusLabels[item.status].ar
      : statusLabels[item.status].en
    : item.status;

  return (
    <article className="group bg-card overflow-hidden border border-border hover:border-primary transition-colors duration-150 flex flex-col">
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start gap-3 mb-3">
          <span className="text-sm font-bold text-primary uppercase tracking-wide">
            {item.project}
          </span>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${statusStyle(
              item.status
            )}`}
          >
            {statusText}
          </span>
        </div>

        <div className="mb-3">
          <span className="inline-block text-xs font-mono font-semibold text-gray-500 dark:text-gray-400 bg-secondary/20 rounded px-2 py-1">
            {item.prLabel}
          </span>
        </div>

        <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors mb-3">
          {item.title}
        </h3>

        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-1 leading-relaxed">
          {item.description}
        </p>

        <a
          href={item.prUrl}
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

  return (
    <>
      <div className="mb-12 ms-4 md:ms-24">
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

      <section
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 mb-16 ms-4 md:ms-24"
        aria-labelledby="opensource"
      >
        {contributions.map((item) => (
          <OpenSourceCard key={item.id} item={item} isArabic={isArabic} />
        ))}
      </section>
    </>
  );
};

export default OpenSource;
