import { useState, useRef, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMessage,
  faTimes,
  faPaperPlane,
  faRobot,
  faUser,
  faStop,
  faExpand,
  faCompress,
} from "@fortawesome/free-solid-svg-icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "../context/LanguageContext";

const CHAT_API_URL = `${import.meta.env.VITE_API_URL}/chat/generate-response`;

// Arabic script Unicode ranges: Arabic, Arabic Supplement, Arabic Extended-A,
// and Arabic Presentation Forms A/B.
const RTL_PATTERN = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const getTextDirection = (text) => (RTL_PATTERN.test(text || "") ? "rtl" : "ltr");

const getGreeting = (isArabic) =>
  isArabic
    ? "مرحباً! أنا المساعد الافتراضي لحسن. كيف يمكنني مساعدتك اليوم؟"
    : "Hi! I'm Hasan's virtual assistant. How can I help you today?";

const markdownComponents = {
  p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
  a: ({ node, ...props }) => (
    <a
      className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc ms-5 my-2 space-y-1" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal ms-5 my-2 space-y-1" {...props} />,
  li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-s-2 border-primary ps-3 my-2 italic text-gray-500 dark:text-gray-400" {...props} />
  ),
  // react-markdown no longer passes an `inline` flag, so infer it: fenced
  // code blocks either declare a language or span multiple lines.
  code: ({ node, className, children, ...props }) => {
    const text = String(children).replace(/\n$/, "");
    const isBlock = /language-/.test(className || "") || text.includes("\n");
    return isBlock ? (
      <code className="font-mono text-xs" {...props}>
        {text}
      </code>
    ) : (
      <code className="bg-secondary border border-border px-1 py-0.5 text-xs font-mono" {...props}>
        {text}
      </code>
    );
  },
  pre: ({ node, children, ...props }) => (
    <pre className="bg-secondary border border-border p-3 my-2 overflow-x-auto text-xs font-mono" {...props}>
      {children}
    </pre>
  ),
  h1: ({ node, ...props }) => <h1 className="text-base font-bold mt-2 mb-1" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-2">
      <table className="border border-border text-xs w-full" {...props} />
    </div>
  ),
  th: ({ node, ...props }) => <th className="border border-border p-1.5 bg-card font-bold text-start" {...props} />,
  td: ({ node, ...props }) => <td className="border border-border p-1.5" {...props} />,
  hr: ({ node, ...props }) => <hr className="border-border my-2" {...props} />,
};

const ChatBot = () => {
  const { isArabic } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: getGreeting(false), isGreeting: true },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keep the untouched greeting message in sync with the site-wide language toggle.
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length !== 1 || !prev[0].isGreeting) return prev;
      return [{ role: "assistant", content: getGreeting(isArabic), isGreeting: true }];
    });
  }, [isArabic]);

  const abortResponse = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    const userMessage = { role: "user", content: userText };
    const updatedMessages = [...messages, userMessage];

    setInput("");
    setIsLoading(true);

    // Matches the server's history schema: { role: "user" | "assistant" | "model", content: string }.
    const history = updatedMessages
      .slice(1, -1)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    const assistantIndex = updatedMessages.length;
    // Append the user message and the assistant placeholder in a single, atomic
    // state update so the two bubbles can never be split across renders.
    setMessages([...updatedMessages, { role: "assistant", content: "" }]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
        },
        body: JSON.stringify({ message: userText, history }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const txt = await response.text().catch(() => "");
        throw new Error(`Server responded with ${response.status}. ${txt}`);
      }

      if (!response.body) throw new Error("No response body stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let buffer = "";
      let isDone = false;

      const appendDelta = (delta) => {
        if (!delta) return;
        setMessages((prev) => {
          const existing = prev[assistantIndex];
          if (!existing) return prev;
          const curr = existing.content ?? "";

          let nextContent;
          if (delta === curr || curr.endsWith(delta)) {
            // Exact repeat of text we already have (duplicate/retried SSE frame): skip it.
            return prev;
          } else if (curr && delta.startsWith(curr)) {
            // Server sent a cumulative snapshot instead of an incremental delta.
            nextContent = delta;
          } else {
            nextContent = curr + delta;
          }

          const updated = [...prev];
          updated[assistantIndex] = { ...existing, content: nextContent };
          return updated;
        });
      };

      while (!isDone) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const evt of events) {
          if (!evt.trim() || evt.startsWith(":")) continue;

          const lines = evt.split("\n");
          let eventType = "message";
          const dataLines = [];

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataLines.push(line.slice(5).trim());
            }
          }

          const dataStr = dataLines.join("\n");

          if (eventType === "done") {
            isDone = true;
            try {
              await reader.cancel();
            } catch {
              // stream already closed
            }
            break;
          }

          if (eventType === "error") {
            let errMsg = "Streaming error";
            try {
              const obj = JSON.parse(dataStr);
              errMsg = obj?.error || errMsg;
            } catch {
              // non-JSON error payload, use default message
            }
            throw new Error(errMsg);
          }

          if (eventType === "message" && dataStr) {
            try {
              const obj = JSON.parse(dataStr);
              // Server sends `data: { "delta": "..." }` and `data: { "chunk": "..." }` events.
              appendDelta(obj?.delta ?? obj?.chunk ?? "");
            } catch {
              appendDelta(dataStr);
            }
          }
        }
        if (isDone) break;
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setMessages((prev) => {
          const hasText = prev[assistantIndex]?.content?.length;
          if (hasText) return prev;
          const updated = [...prev];
          updated[assistantIndex] = {
            role: "assistant",
            content: isArabic ? "تم إلغاء الرد." : "Response was cancelled.",
          };
          return updated;
        });
      } else {
        console.error("[ChatBot] Request failed:", error.message);
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantIndex] = {
            role: "assistant",
            content: isArabic
              ? "عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى لاحقاً."
              : "Sorry, something went wrong. Please try again later.",
          };
          return updated;
        });
      }
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const inputDir = input.trim() ? getTextDirection(input) : (isArabic ? "rtl" : "ltr");

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div
          className={`mb-4 bg-card border border-border flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 transition-[width,height] ${
            isExpanded
              ? "w-[92vw] sm:w-[560px] h-[80vh] max-h-[720px]"
              : "w-80 sm:w-96 h-[500px]"
          }`}
          role="dialog"
          aria-label="Chat with AI Assistant"
        >
          <div className="bg-primary p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faRobot} />
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {isArabic ? "مساعد حسن" : "Hasan's Assistant"}
                </h3>
                <span className="text-[10px] opacity-80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                  {isArabic ? "متصل" : "Online"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="p-2 hover:bg-white/10 transition-colors"
                aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
                title={
                  isExpanded
                    ? isArabic
                      ? "تصغير"
                      : "Collapse"
                    : isArabic
                      ? "توسيع"
                      : "Expand"
                }
              >
                <FontAwesomeIcon icon={isExpanded ? faCompress : faExpand} className="text-sm" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-secondary/30">
            {messages.map((msg, index) => {
              // The in-flight assistant placeholder (empty content) is represented
              // by the typing-indicator block below instead of an empty bubble here.
              const isPendingPlaceholder =
                msg.role === "assistant" && msg.content === "" && index === messages.length - 1 && isLoading;
              if (isPendingPlaceholder) return null;

              const dir = getTextDirection(msg.content);
              return (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    dir={dir}
                    className={`max-w-[80%] p-3 text-sm ${dir === "rtl" ? "text-right" : "text-left"} ${
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : "bg-card border border-border text-text"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 mb-1 opacity-70 text-[10px] uppercase font-bold tracking-wider ${
                        dir === "rtl" ? "flex-row-reverse justify-end" : ""
                      }`}
                    >
                      <FontAwesomeIcon icon={msg.role === "user" ? faUser : faRobot} />
                      {msg.role === "user" ? (isArabic ? "أنت" : "You") : (isArabic ? "المساعد" : "Assistant")}
                    </div>
                    {msg.role === "assistant" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex justify-start">
                <div className="bg-card border border-border text-text p-3 text-sm">
                  <div className="flex items-center gap-2 mb-1 opacity-70 text-[10px] uppercase font-bold tracking-wider">
                    <FontAwesomeIcon icon={faRobot} />
                    {isArabic ? "المساعد" : "Assistant"}
                  </div>
                  <div className="flex gap-1 items-center py-1">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 bg-card border-t border-border flex gap-2"
          >
            <input
              type="text"
              dir={inputDir}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isLoading
                  ? isArabic
                    ? "بانتظار الرد..."
                    : "Waiting for response..."
                  : isArabic
                    ? "اكتب رسالة..."
                    : "Type a message..."
              }
              disabled={isLoading}
              className={`flex-1 bg-secondary border border-border p-2 px-4 text-sm focus:outline focus:outline-2 focus:outline-primary transition-colors font-medium disabled:opacity-50 ${
                inputDir === "rtl" ? "text-right" : "text-left"
              }`}
              aria-label="Message text"
            />
            {isLoading ? (
              <button
                type="button"
                onClick={abortResponse}
                className="w-10 h-10 bg-red-500 text-white flex items-center justify-center hover:opacity-90 transition-opacity shrink-0"
                aria-label="Stop generating"
              >
                <FontAwesomeIcon icon={faStop} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 bg-primary text-white flex items-center justify-center hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 shrink-0"
                aria-label="Send message"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            )}
          </form>
        </div>
      )}

      <div dir={isArabic ? "rtl" : "ltr"} className="flex items-center gap-3">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-card border border-border text-text text-sm font-semibold px-4 py-2.5 whitespace-nowrap hover:border-primary hover:text-primary transition-colors animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {isArabic ? "اسأل عن حسن" : "Ask about Hasan"}
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-colors duration-150 shrink-0 ${
            isOpen ? "bg-red-500" : "bg-primary hover:bg-[var(--primary-hover)]"
          }`}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close chat" : "Open chat with Hasan's assistant"}
        >
          <FontAwesomeIcon icon={isOpen ? faTimes : faMessage} className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
