import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faGlobe, faTerminal } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import Header from "../components/Header";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";
import ChatBot from "../components/ChatBot";
import { useApi } from "../hooks/useApi";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProjectDetails() {
  const { id } = useParams();
  const { request } = useApi();
  const { isArabic } = useLanguage();
  const [project, setProject] = useState<any>(null);
  const [techColors, setTechColors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
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
    fetchTechColors();
  }, []);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const response = await request(`${API_URL}/projects/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch project details");
      }
      const data = await response.json();
      setProject(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching project:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const getTechStyle = (techName: string) => {
    const found = techColors.find(c => c.name.toLowerCase() === techName.toLowerCase());
    if (found) {
      return { backgroundColor: found.bgColor, color: found.textColor };
    }
    return { backgroundColor: "#6b7280", color: "#ffffff" };
  };

  return (
    <div className="min-h-screen bg-secondary text-text font-sans transition-colors duration-300 flex flex-col">
      <Header />
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="p-4 lg:p-8 flex-grow">
        <section className="container mx-auto max-w-5xl py-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium mb-8 bg-card px-4 py-2 border border-border"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> {isArabic ? "العودة للرئيسية" : "Back to Home"}
          </Link>

          {loading ? (
            <div className="py-20">
              <Loader message={isArabic ? "جاري تحميل تفاصيل المشروع..." : "Loading project details..."} />
            </div>
          ) : error ? (
            <div className="py-20">
              <ErrorMessage 
                message={error} 
                onRetry={fetchProjectDetails} 
              />
            </div>
          ) : !project ? (
            <div className="text-center py-20 text-gray-500 bg-card border border-dashed border-border">
              <p className="font-bold text-lg mb-2">{isArabic ? "المشروع غير موجود" : "Project Not Found"}</p>
              <p className="text-sm">{isArabic ? "لم نتمكن من العثور على المشروع المطلوب." : "We couldn't find the requested project."}</p>
            </div>
          ) : (
            <div className="bg-card overflow-hidden border border-border">
              {project.imageUrl && (
                 <div className="w-full h-64 md:h-96 relative">
                   <img
                     src={project.imageUrl}
                     alt={project.title}
                     className="w-full h-full object-cover"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                 </div>
              )}
              
              <div className="p-8 md:p-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-text mb-6">
                  {isArabic ? (project.title_ar || project.title) : project.title}
                </h1>

                <div className="flex flex-wrap gap-3 mb-8">
                  {project.technologies?.map((tech: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 rounded-full py-1.5 px-4 text-sm font-semibold shadow-sm"
                      style={getTechStyle(tech)}
                    >
                      <FontAwesomeIcon icon={faTerminal} className="opacity-70 text-xs" />
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none mb-10 text-gray-600 dark:text-gray-300">
                  <p className="whitespace-pre-line leading-relaxed">
                    {isArabic ? (project.description_ar || project.description) : project.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-8 pt-8 border-t border-border/50">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-black dark:bg-slate-800 text-white py-3 px-6 font-bold hover:bg-primary transition-colors duration-150 border border-transparent dark:border-white/10"
                    >
                      <FontAwesomeIcon icon={faGithub} className="text-xl" /> {isArabic ? "الكود المصدر" : "Source Code"}
                    </a>
                  )}
                  {(project.projectUrl || project.link) && (
                    <a
                      href={project.projectUrl || project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-primary text-white py-3 px-6 font-bold hover:bg-[var(--primary-hover)] transition-colors duration-150"
                    >
                      <FontAwesomeIcon icon={faGlobe} className="text-xl" /> {isArabic ? "عرض المشروع" : "Live Demo or Project Link"}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
      <ChatBot />
    </div>
  );
}
