import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faRotate, faFilePdf, faDatabase } from "@fortawesome/free-solid-svg-icons";
import StatusAlert from "../common/StatusAlert";
import { useApi } from "../../hooks/useApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const ChatManage = () => {
  const { request } = useApi();
  const [rebuilding, setRebuilding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleRebuild = async () => {
    setRebuilding(true);
    try {
      const response = await request(`${API_URL}/vector/reindex`, { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Failed to rebuild the knowledge base");
      setStatusMessage({
        type: 'success',
        text: `Knowledge base rebuilt from ${data.documentCount ?? "?"} document(s).`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setRebuilding(false);
    }
  };

  return (
    <main className="p-4 md:p-8 h-full overflow-y-auto custom-scrollbar bg-secondary/30 backdrop-blur-sm">
      <section className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-black text-text tracking-tight">
          Chatbot Knowledge Base
        </h1>

        {statusMessage && (
          <StatusAlert
            type={statusMessage.type}
            message={statusMessage.text}
            onClose={() => setStatusMessage(null)}
          />
        )}

        <article className="p-6 md:p-8 bg-card border border-border space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faRobot} className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text mb-1">What the assistant knows</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                The site's chatbot answers questions using a knowledge base built from your{" "}
                <strong>Work Experience</strong>, <strong>Projects</strong>, <strong>Open Source</strong> and{" "}
                <strong>Certificates</strong> entries, plus the text extracted from the CV PDF attached
                to your Main/Hero section. It does not read these live — it uses a snapshot that is
                rebuilt each time the server starts, or whenever you press the button below.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-secondary/20 rounded-full">
              <FontAwesomeIcon icon={faDatabase} /> Database content
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 bg-secondary/20 rounded-full">
              <FontAwesomeIcon icon={faFilePdf} /> Uploaded CV PDF
            </span>
          </div>

          <button
            onClick={handleRebuild}
            disabled={rebuilding}
            className="p-4 bg-primary text-white font-bold hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faRotate} className={rebuilding ? "animate-spin" : ""} />
            {rebuilding ? "Rebuilding..." : "Rebuild Knowledge Base Now"}
          </button>
          <p className="text-xs text-gray-500">
            Run this after editing your experience, projects, open source, or certificates,
            or after uploading a new CV, so the chatbot's answers stay in sync.
          </p>
        </article>
      </section>
    </main>
  );
};
