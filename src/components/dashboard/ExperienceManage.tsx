import {
  faXmark,
  faTrash,
  faEdit,
  faPlus,
  faCheck,
  faChevronLeft,
  faChevronRight,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import Loader from "../common/Loader";
import ErrorMessage from "../common/ErrorMessage";
import StatusAlert from "../common/StatusAlert";
import { useApi } from "../../hooks/useApi";

interface Experience {
  _id?: string;
  id?: string;
  role: string;
  role_ar: string;
  company: string;
  companyUrl: string;
  location: string;
  location_ar: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  description_ar: string;
  technologies: string[];
}

interface TechColor {
  _id: string;
  name: string;
  bgColor: string;
  textColor: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const emptyForm: Experience = {
  role: "",
  role_ar: "",
  company: "",
  companyUrl: "",
  location: "",
  location_ar: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
  description_ar: "",
  technologies: [],
};

const toDateInput = (value?: string) => (value ? value.slice(0, 10) : "");

export const ExperienceManage = () => {
  const { request } = useApi();
  const [tech, setTech] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<Experience[]>([]);
  const [dynamicTechColors, setDynamicTechColors] = useState<TechColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [page, setPage] = useState(1);
  const limit = 3;
  const [editingItem, setEditingItem] = useState<Experience | null>(null);
  const [formData, setFormData] = useState<Experience>(emptyForm);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const fetchColors = async () => {
    try {
      const response = await request(`${API_URL}/colorschemas`);
      if (response.ok) {
        const data = await response.json();
        setDynamicTechColors(data);
      }
    } catch (err) {
      console.error("Failed to fetch colors", err);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await request(
        `${API_URL}/experiences?limit=${limit}&page=${page}`,
      );
      if (!response.ok) throw new Error("Failed to fetch experiences");
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
    fetchItems();
  }, [page]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTech = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value && !tech.includes(value)) {
      setTech([...tech, value]);
    }
    e.target.value = "";
  };

  const handleRemoveTech = (t: string) => {
    setTech((prev) => prev.filter((item) => item !== t));
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setTech([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemToSave = {
      ...formData,
      technologies: tech,
      endDate: formData.current ? undefined : formData.endDate || undefined,
    };
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem
      ? `${API_URL}/experiences/${editingItem._id || editingItem.id}`
      : `${API_URL}/experiences`;

    try {
      const response = await request(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemToSave),
      });
      if (!response.ok) throw new Error("Failed to save experience");

      setStatusMessage({ type: 'success', text: `Experience ${editingItem ? 'updated' : 'created'} successfully!` });
      setShowForm(false);
      resetForm();
      fetchItems();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleEdit = (item: Experience) => {
    setEditingItem(item);
    setFormData({
      ...item,
      startDate: toDateInput(item.startDate),
      endDate: toDateInput(item.endDate),
    });
    setTech(item.technologies || []);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await request(`${API_URL}/experiences/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete experience");
      setStatusMessage({ type: 'success', text: 'Experience deleted successfully' });
      setShowDeleteModal(null);
      fetchItems();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const getTechStyle = (techName: string) => {
    const found = dynamicTechColors.find(c => c.name.toLowerCase() === techName.toLowerCase());
    if (found) {
      return { backgroundColor: found.bgColor, color: found.textColor };
    }
    return { backgroundColor: "#6b7280", color: "#ffffff" }; // Default gray
  };

  const formatRange = (item: Experience) => {
    const start = item.startDate ? new Date(item.startDate).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "";
    const end = item.current ? "Present" : (item.endDate ? new Date(item.endDate).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "");
    return `${start} — ${end}`;
  };

  return (
    <>
      <main className="p-4 md:p-8 h-full overflow-y-auto custom-scrollbar bg-secondary/30 backdrop-blur-sm">
        <section className="max-w-6xl mx-auto space-y-8">
          <article className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-6 md:gap-0 items-center justify-between w-full">
              <h1 className="text-4xl font-black text-text tracking-tight">
                Experience Management
              </h1>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (showForm) {
                    resetForm();
                  }
                }}
                className="p-4 bg-primary text-white font-bold hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={showForm ? faXmark : faPlus} />
                {showForm ? "Cancel" : "Add Experience"}
              </button>
            </div>
          </article>

          {statusMessage && (
            <StatusAlert
              type={statusMessage.type}
              message={statusMessage.text}
              onClose={() => setStatusMessage(null)}
            />
          )}

          {showForm && (
            <article className="p-4 md:p-8 bg-card border border-border animate-in fade-in slide-in-from-top-4 duration-300">
              <h2 className="text-2xl font-bold mb-6">
                {editingItem ? "Edit Experience" : "Add Experience"}
              </h2>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="e.g. Backend Developer"
                    className="w-full p-4 bg-secondary/20 border border-border focus:border-primary outline-none transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">
                    Role (Arabic)
                  </label>
                  <input
                    type="text"
                    name="role_ar"
                    value={formData.role_ar}
                    onChange={handleInputChange}
                    placeholder="المسمى الوظيفي"
                    dir="rtl"
                    className="w-full p-4 bg-secondary/20 border border-border focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g. Acme Inc."
                    className="w-full p-4 bg-secondary/20 border border-border focus:border-primary outline-none transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">
                    Company URL
                  </label>
                  <input
                    type="text"
                    name="companyUrl"
                    value={formData.companyUrl}
                    onChange={handleInputChange}
                    placeholder="https://company.com"
                    className="w-full p-4 bg-secondary/20 border border-border focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Remote / Amman, Jordan"
                    className="w-full p-4 bg-secondary/20 border border-border focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">
                    Location (Arabic)
                  </label>
                  <input
                    type="text"
                    name="location_ar"
                    value={formData.location_ar}
                    onChange={handleInputChange}
                    placeholder="الموقع"
                    dir="rtl"
                    className="w-full p-4 bg-secondary/20 border border-border focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-secondary/20 border border-border focus:border-primary outline-none transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    disabled={formData.current}
                    className="w-full p-4 bg-secondary/20 border border-border focus:border-primary outline-none transition-colors disabled:opacity-40"
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-400 pt-1">
                    <input
                      type="checkbox"
                      name="current"
                      checked={formData.current}
                      onChange={handleInputChange}
                      className="accent-primary"
                    />
                    I currently work here
                  </label>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-400">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="What did you do in this role..."
                    className="w-full p-4 bg-secondary/20 border border-border focus:border-primary outline-none transition-colors h-32 resize-none"
                    required
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-400">
                    Description (Arabic)
                  </label>
                  <textarea
                    name="description_ar"
                    value={formData.description_ar}
                    onChange={handleInputChange}
                    placeholder="وصف الدور..."
                    dir="rtl"
                    className="w-full p-4 bg-secondary/20 border border-border focus:border-primary outline-none transition-colors h-32 resize-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <label className="text-sm font-semibold text-gray-400">
                    Technologies
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 bg-secondary/10 border border-dashed border-border">
                    {tech.map((t) => (
                      <span
                        key={t}
                        className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                        style={getTechStyle(t)}
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(t)}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      </span>
                    ))}
                    {tech.length === 0 && (
                      <span className="text-gray-500 text-xs italic">
                        No technologies added
                      </span>
                    )}
                  </div>
                  <select
                    onChange={handleAddTech}
                    className="w-full p-4 bg-secondary/20 border border-border focus:border-primary outline-none transition-colors"
                  >
                    <option value="">Add a technology...</option>
                    {dynamicTechColors.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="md:col-span-2 p-4 bg-primary text-white font-bold hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faCheck} />
                  {editingItem ? "Update Experience" : "Add Experience"}
                </button>
              </form>
            </article>
          )}

          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Existing Experience</h2>
              <div className="h-px flex-1 bg-border/50" />
            </div>

            {loading ? (
              <div className="py-20">
                <Loader message="Loading experience..." />
              </div>
            ) : error ? (
              <div className="py-20">
                <ErrorMessage
                  message={error}
                  onRetry={() => fetchItems()}
                />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20 bg-secondary/10 border border-dashed border-border flex flex-col items-center">
                <FontAwesomeIcon icon={faBriefcase} className="text-3xl text-gray-400 mb-4" />
                <p className="text-gray-500 font-medium mb-4">
                  No experience found on this page.
                </p>
                {page > 1 && (
                  <button
                    onClick={() => setPage(page - 1)}
                    className="text-primary hover:underline font-bold"
                  >
                    Go back to previous page
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <article
                    key={item._id || item.id}
                    className="group relative bg-card overflow-hidden border border-border transition-colors duration-300 flex flex-col"
                  >
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-text line-clamp-1 flex-1">
                          {item.role}
                        </h3>
                        {item.current && (
                          <span className="px-2 py-1 text-xs font-bold rounded-full ml-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-primary text-sm font-bold mb-1 line-clamp-1">
                        {item.company}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        {formatRange(item)}
                      </p>
                      <p className="text-gray-500 text-xs mb-4 line-clamp-3 flex-1">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {item.technologies?.slice(0, 3).map((t, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors"
                            style={getTechStyle(t)}
                          >
                            {t}
                          </span>
                        ))}
                        {item.technologies?.length > 3 && (
                          <span className="text-[10px] text-gray-400">
                            +{item.technologies.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex-1 py-2 bg-blue-500 text-white text-xs font-bold text-center hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(item._id || item.id || null)}
                          className="w-10 h-10 bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {(items.length > 0 || page > 1) && (
              <div className="flex flex-col items-center gap-4 pt-8">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="w-10 h-10 border border-border flex items-center justify-center text-text hover:bg-primary hover:border-primary hover:text-white disabled:opacity-30 transition-colors group"
                  >
                    <FontAwesomeIcon
                      icon={faChevronLeft}
                      className="group-hover:-translate-x-0.5"
                    />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Page
                    </span>
                    <span className="text-xl font-black text-primary">
                      {page}
                    </span>
                  </div>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={items.length < limit || loading}
                    className="w-10 h-10 border border-border flex items-center justify-center text-text hover:bg-primary hover:border-primary hover:text-white disabled:opacity-30 transition-colors group"
                  >
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="group-hover:translate-x-0.5"
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md p-6 border border-border animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2">Delete Experience?</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this experience entry? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 p-3 bg-secondary/50 font-bold hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => showDeleteModal && handleDelete(showDeleteModal)}
                className="flex-1 p-3 bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
