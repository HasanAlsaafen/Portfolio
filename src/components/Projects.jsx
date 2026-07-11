import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";
import Loader from "./common/Loader";
import ErrorMessage from "./common/ErrorMessage";
import { handleImageError } from "../utils/imageFallback";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ProjectCard = ({ project, techColors, isArabic }) => {
  const getTechStyle = (techName) => {
    const found = techColors.find(c => c.name.toLowerCase() === techName.toLowerCase());
    if (found) {
      return { backgroundColor: found.bgColor, color: found.textColor };
    }
    return { backgroundColor: "#6b7280", color: "#ffffff" }; // Default gray
  };

  return (
    <article className="group bg-card overflow-hidden border border-border hover:border-primary transition-colors duration-150">
      <div className="relative overflow-hidden">
        <Link to={`/project/${project._id || project.id}`} title="View Details">
          <img
            src={project.imageUrl}
            alt={project.title}
            onError={handleImageError}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
             <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">{isArabic ? "عرض التفاصيل" : "View Details"}</span>
          </div>
        </Link>
      </div>

      <div className="p-6">
        <Link to={`/project/${project._id || project.id}`}>
          <h3 className="text-xl font-bold text-text mb-2 group-hover:text-primary transition-colors inline-block">
            {isArabic ? (project.title_ar || project.title) : project.title}
          </h3>
        </Link>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {isArabic ? (project.description_ar || project.description) : project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.map((tech, index) => (
            <span
              key={index}
              className="inline-block rounded-full py-1 px-3 text-xs font-medium shadow-sm"
              style={getTechStyle(tech)}
            >
              {tech}
            </span>
          ))}
        </div>

        <a
          href={project.github || "https://github.com/HasanAlsaafen"}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-black dark:bg-slate-700 text-white py-2 px-5 text-sm font-medium hover:bg-primary transition-colors"
        >
          {isArabic ? "عرض على GitHub" : "View on GitHub"} <FontAwesomeIcon icon={faArrowRight} className="rtl:rotate-180" />
        </a>
      </div>
    </article>
  );
};

const Projects = () => {
  const { isArabic } = useLanguage();
  const [projects, setProjects] = useState([]);
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

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/projects?limit=${limit}&page=${page}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      
      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechColors();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [page]);

  return (
    <>
      <div className="mb-12 ms-4 md:ms-24 ">
        <h2
          className="text-primary text-xs font-bold uppercase tracking-wide mb-4 flex items-center gap-3 before:content-[''] before:w-8 before:h-[1px] before:bg-primary/30"
          id="projects"
        >
          {isArabic ? "أعمال مختارة" : "Selected Works"}
        </h2>
        <h3 className="text-4xl font-extrabold text-text leading-tight">
          {isArabic ? (<>مشاريع <span className="text-primary">مميزة</span></>) : (<>Featured <span className="text-primary">Projects</span></>)}
        </h3>
      </div>

      <section 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 ms-4 md:ms-24 min-h-[400px]"
        aria-labelledby="projects"
      >
        {loading ? (
          <div className="col-span-full py-10">
            <Loader message={isArabic ? "جاري تحميل الأعمال..." : "Fetching creative works..."} />
          </div>
        ) : error ? (
          <div className="col-span-full py-10">
            <ErrorMessage 
              message={error} 
              onRetry={() => fetchProjects()} 
            />
          </div>
        ) : projects.length > 0 ? (
          projects.map((proj) => (
            <ProjectCard key={proj._id || proj.id} project={proj} techColors={techColors} isArabic={isArabic} />
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-gray-500 bg-secondary/10 border border-dashed border-border">
            <p className="font-bold text-lg mb-2">{isArabic ? "لا توجد مشاريع" : "No Projects Found"}</p>
            <p className="text-sm">{isArabic ? "تحقق لاحقاً للتحديثات الجديدة!" : "Check back later for new updates!"}</p>
          </div>
        )}
      </section>

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
              document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
            }}
            disabled={projects.length < limit || loading}
            className="w-12 h-12 border border-border flex items-center justify-center text-text hover:bg-primary hover:border-primary hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed group"
            title="Next Page"
          >
            <FontAwesomeIcon icon={faChevronRight} className="group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform rtl:rotate-180" />
          </button>
        </div>

        <div className="w-16 h-1 bg-primary/20" />

        <a
          href="https://github.com/HasanAlsaafen"
          target="_blank"
          rel="noreferrer"
          className="bg-black dark:bg-slate-800 text-white py-4 px-10 no-underline hover:bg-primary transition-colors duration-150 flex items-center gap-3 font-semibold"
        >
          {isArabic ? "استعراض جميع المستودعات" : "Explore All Repositories"} <FontAwesomeIcon icon={faGithub} className="text-lg" />
        </a>
      </div>
    </>
  );
};

export default Projects;
