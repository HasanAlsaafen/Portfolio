const contributions = [
  {
    title: "nestjs-zod · TypeScript · 1k+ stars · PR #377",
    title_ar: "nestjs-zod · TypeScript · 1k+ stars · PR #377",
    description: "Fixed a bug in cleanupOpenApiDoc where nested $refs were not rewritten after schema renaming, causing Swagger UI resolver errors for array responses and union schemas. Introduced a recursive rewriteRefs helper that traverses the full OpenAPI schema tree and rewrites stale $ref values regardless of nesting depth. Added a regression test covering the exact failing scenario (@ZodResponse({ type: [Dto] }) with meta({ id })).",
    description_ar: "إصلاح خطأ في cleanupOpenApiDoc حيث لم تتم إعادة كتابة مراجع $refs المتداخلة، مما تسبب في أخطاء في واجهة Swagger UI.",
    repoUrl: "https://github.com/risenforces/nestjs-zod",
    prUrl: "https://github.com/risenforces/nestjs-zod/pull/377",
    status: "Merged",
    technologies: ["TypeScript", "Node.js"]
  },
  {
    title: "rowboat · TypeScript · 4.3k+ stars · PR #545",
    title_ar: "rowboat · TypeScript · 4.3k+ stars · PR #545",
    description: "Fixed a critical crash where long conversations exceeded the model's context window limit, causing the API to return a hard 400 bad_request_error surfaced directly to the user with no recovery. Implemented a truncateMessagesToFit() utility in context-utils.ts called inside streamLlm() — the single send-to-AI-SDK callsite — preserving system messages, dropping oldest non-system messages first, and enforcing tool-call/tool-result pairing integrity. Applied a conservative heuristic token counter (⌈chars / 4⌉) with an 80 k-token default budget, covering all supported models (Claude 3.x, GPT-4o, Gemini 1.5, Llama 3) while leaving headroom for system prompt and output.",
    description_ar: "إصلاح عطل حرج حيث تتجاوز المحادثات الطويلة حد نافذة سياق النموذج. تم تنفيذ أداة truncateMessagesToFit() للحفاظ على رسائل النظام وإسقاط أقدم الرسائل أولاً مع الحفاظ على اقتران استدعاء الأدوات.",
    repoUrl: "https://github.com/rowboatlabs/rowboat",
    prUrl: "https://github.com/rowboatlabs/rowboat/pull/545",
    status: "Merged",
    technologies: ["TypeScript", "AI"]
  }
];

async function insert() {
  for (const item of contributions) {
    try {
      const res = await fetch('http://localhost:3000/opensources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        console.log(`Inserted: ${item.title}`);
      } else {
        console.error(`Failed: ${item.title}`);
      }
    } catch (e) {
      console.error('Error connecting to backend:', e.message);
    }
  }
}

insert();
