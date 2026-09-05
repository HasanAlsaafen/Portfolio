import { useState } from "react";
import { 
  faBars, 
  faXmark, 
  faHome, 
  faProjectDiagram, 
  faCertificate,
  faEnvelope,
  faChevronLeft,
  faChevronRight,
  faRightFromBracket,
  faPalette,
  faCodeBranch,
  faBriefcase,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { name: "Main", icon: faHome  },
  { name: "Experience", icon: faBriefcase },
  { name: "Projects", icon: faProjectDiagram },
  { name: "Certificates", icon: faCertificate },
  { name: "Open Source", icon: faCodeBranch },
  { name: "Colors", icon: faPalette },
  { name: "Chatbot", icon: faRobot },
  { name: "Messages", icon: faEnvelope },
];

export default function SideBar({
  selectedItem,
  setSelectedItem,
}: {
  selectedItem: string;
  setSelectedItem: (item: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    
    navigate("/login");
  };

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      <aside 
        className={`hidden md:flex flex-col bg-card border-r border-border h-screen transition-all duration-300 ease-in-out relative z-40 ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className={`mb-8 flex items-center ${isOpen ? "justify-between" : "justify-center"}`}>
            {isOpen && (
              <div className="overflow-hidden">
                <h1 className="text-xl font-bold text-text truncate">Admin Page</h1>
                <p className="text-sm text-gray-500 truncate">@Hasan Al-Saafin</p>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className={`p-2 hover:bg-secondary text-gray-400 hover:text-primary transition-colors ${!isOpen && "mt-2"}`}
            >
              <FontAwesomeIcon icon={isOpen ? faChevronLeft : faChevronRight} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setSelectedItem(item.name)}
                className={`w-full flex items-center p-3 border-l-[3px] transition-colors group ${
                  selectedItem === item.name
                    ? "bg-primary/10 text-primary border-primary"
                    : "text-gray-500 border-transparent hover:bg-secondary hover:text-primary"
                } ${isOpen ? "space-x-3" : "justify-center"}`}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className={`text-lg ${isOpen ? "" : "m-1"}`}
                />
                {isOpen && <span className="font-medium">{item.name}</span>}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t border-border">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center p-3 transition-colors text-error hover:bg-error/10 ${
                isOpen ? "space-x-3" : "justify-center"
              }`}
            >
              <FontAwesomeIcon
                icon={faRightFromBracket}
                className="text-lg"
              />
              {isOpen && <span className="font-bold uppercase tracking-widest text-xs">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      <button
        onClick={toggleMobileSidebar}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-white shadow-lg z-50 flex items-center justify-center hover:bg-[var(--primary-hover)] transition-colors"
      >
        <FontAwesomeIcon icon={isMobileOpen ? faXmark : faBars} size="lg" />
      </button>

      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={toggleMobileSidebar}
        />
      )}

      <aside
        className={`md:hidden fixed top-0 left-0 h-screen bg-card border-r border-border z-40 w-64 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="mb-8 p-2">
            <h1 className="text-xl font-bold text-text">Admin Page</h1>
            <p className="text-sm text-gray-500">@Hasan Al-Saafin</p>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={()=>
                {
                  toggleMobileSidebar();
                  setSelectedItem(item.name);
                }
                }
                className={`w-full flex items-center space-x-3 p-4 border-l-[3px] transition-colors ${
                  selectedItem === item.name
                    ? "bg-primary/10 text-primary border-primary"
                    : "text-gray-500 border-transparent hover:bg-secondary"
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="text-lg w-6" />
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-4 text-error hover:bg-error/10 transition-colors"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="text-lg w-6" />
              <span className="font-bold uppercase tracking-widest text-xs">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
