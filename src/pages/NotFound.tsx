import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faHome, faSearch } from "@fortawesome/free-solid-svg-icons";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="relative mb-12">
          {/* Big Ghosty 404 */}
          <h1 className="text-[12rem] md:text-[20rem] font-black text-primary/5 select-none leading-none">
            404
          </h1>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-24 h-24 border border-error/20 bg-error/10 text-error flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl animate-bounce" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-text tracking-tighter">
              Page Not Found
            </h2>
          </div>
        </div>

        <p className="text-xl text-gray-500 font-medium mb-12 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-semibold hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] transition-colors duration-150 flex items-center justify-center gap-3"
          >
            <FontAwesomeIcon icon={faHome} />
            BACK TO HOME
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-8 py-4 bg-card border border-border text-text font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-3"
          >
            GO BACK
          </button>
        </div>

        {/* Decorative elements */}
        <div className="mt-20 flex items-center justify-center gap-8 opacity-20">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-text"></div>
          <FontAwesomeIcon icon={faSearch} className="text-2xl" />
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-text"></div>
        </div>
      </div>
    </div>
  );
}
