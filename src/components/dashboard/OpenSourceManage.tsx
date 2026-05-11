import {
  faXmark,
  faTrash,
  faEdit,
  faPlus,
  faCheck,
  faChevronLeft,
  faChevronRight,
  faCodeBranch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import Loader from "../common/Loader";
import ErrorMessage from "../common/ErrorMessage";
import StatusAlert from "../common/StatusAlert";
import { useApi } from "../../hooks/useApi";

interface OpenSource {
  _id?: string;
  id?: string;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  repoUrl: string;
  prUrl: string;
  status: string;
  technologies: string[];
}

interface TechColor {
  _id: string;
  name: string;
  bgColor: string;
  textColor: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const OpenSourceManage = () => {
  const { request } = useApi();
  const [tech, setTech] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<OpenSource[]>([]);
  const [dynamicTechColors, setDynamicTechColors] = useState<TechColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [page, setPage] = useState(1);
  const limit = 3;
  const [editingItem, setEditingItem] = useState<OpenSource | null>(null);
  const [formData, setFormData] = useState<OpenSource>({
    title: "",
    title_ar: "",
    description: "",
    description_ar: "",
    repoUrl: "",
    prUrl: "",
    status: "Open",
    technologies: [],
  });
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
        `${API_URL}/opensources?limit=${limit}&page=${page}`,
      );
      if (!response.ok) throw new Error("Failed to fetch open source contributions");
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
    const { name, value } = e.target;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemToSave = { ...formData, technologies: tech };
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem
      ? `${API_URL}/opensources/${editingItem._id || editingItem.id}`
      : `${API_URL}/opensources`;

    try {
      const response = await request(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemToSave),
      });
      if (!response.ok) throw new Error("Failed to save contribution");

      setStatusMessage({ type: 'success', text: `Contribution ${editingItem ? 'updated' : 'created'} successfully!` });
      setShowForm(false);
      setEditingItem(null);
      setFormData({
        title: "",
        title_ar: "",
        description: "",
        description_ar: "",
        repoUrl: "",
        prUrl: "",
        status: "Open",
        technologies: [],
      });
      setTech([]);
      fetchItems();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleEdit = (item: OpenSource) => {
    setEditingItem(item);
    setFormData(item);
    setTech(item.technologies);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await request(`${API_URL}/opensources/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete contribution");
      setStatusMessage({ type: 'success', text: 'Contribution deleted successfully' });
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

  return (
    <>
      <main className="p-4 md:p-8 h-full overflow-y-auto custom-scrollbar bg-secondary/30 backdrop-blur-sm">
        <section className="max-w-6xl mx-auto space-y-8">
          <article className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-6 md:gap-0 items-center justify-between w-full">
              <h1 className="text-4xl font-black text-text tracking-tight">
                Open Source Management
              </h1>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (showForm) {
                    setEditingItem(null);
                    setFormData({
                      title: "",
                      title_ar: "",
                      description: "",
                      description_ar: "",
                      repoUrl: "",
                      prUrl: "",
                      status: "Open",
                      technologies: [],
                    });
                    setTech([]);
                  }
                }}
                className="p-4 shadow-xl rounded-2xl bg-primary border-shadow text-white font-bold hover:-translate-y-0.5 shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center gap-2"
              >
                <FontAwesomeIcon icon={showForm ? faXmark : faPlus} />
                {showForm ? "Cancel" : "Add Contribution"}
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
            <article className="p-4 md:p-8 bg-card shadow-2xl rounded-2xl border border-border animate-in fade-in slide-in-from-top-4 duration-300">
              <h2 className="text-2xl font-bold mb-6">
                {editingItem ? "Edit Contribution" : "Add Contribution"}
              </h2>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Added dark mode feature"
                    className="w-full p-4 rounded-xl bg-secondary/20 border border-border focus:border-primary outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">
                    Title (Arabic)
                  </label>
                  <input
                    type="text"
                    name="title_ar"
                    value={formData.title_ar}
                    onChange={handleInputChange}
                    placeholder="العنوان بالعربية"
                    dir="rtl"
                    className="w-full p-4 rounded-xl bg-secondary/20 border border-border focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">
                    Repository URL
                  </label>
                  <input
                    type="text"
                    name="repoUrl"
                    value={formData.repoUrl}
                    onChange={handleInputChange}
                    placeholder="https://github.com/..."
                    className="w-full p-4 rounded-xl bg-secondary/20 border border-border focus:border-primary outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">
                    Pull Request URL
                  </label>
                  <input
                    type="text"
                    name="prUrl"
                    value={formData.prUrl}
                    onChange={handleInputChange}
                    placeholder="https://github.com/.../pull/..."
                    className="w-full p-4 rounded-xl bg-secondary/20 border border-border focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-xl bg-secondary/20 border border-border focus:border-primary outline-none transition-all"
                  >
                    <option value="Open">Open</option>
                    <option value="Merged">Merged</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-400">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Contribution description..."
                    className="w-full p-4 rounded-xl bg-secondary/20 border border-border focus:border-primary outline-none transition-all h-32 resize-none"
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
                    placeholder="وصف المساهمة..."
                    dir="rtl"
                    className="w-full p-4 rounded-xl bg-secondary/20 border border-border focus:border-primary outline-none transition-all h-32 resize-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <label className="text-sm font-semibold text-gray-400">
                    Technologies
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 rounded-xl bg-secondary/10 border border-dashed border-border">
                    {tech.map((t) => (
                      <span
                        key={t}
                        className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium shadow-sm transition-all"
                        style={getTechStyle(t)}
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(t)}
                          className="hover:scale-125 transition-transform"
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
                    className="w-full p-4 rounded-xl bg-secondary/20 border border-border focus:border-primary outline-none transition-all"
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
                  className="md:col-span-2 p-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faCheck} />
                  {editingItem ? "Update Contribution" : "Add Contribution"}
                </button>
              </form>
            </article>
          )}

          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Existing Contributions</h2>
              <div className="h-px flex-1 bg-border/50" />
            </div>

            {loading ? (
              <div className="py-20">
                <Loader message="Loading contributions..." />
              </div>
            ) : error ? (
              <div className="py-20">
                <ErrorMessage 
                  message={error} 
                  onRetry={() => fetchItems()} 
                />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-border flex flex-col items-center">
                <p className="text-gray-500 font-medium mb-4">
                  No contributions found on this page.
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
                    className="group relative bg-card rounded-2xl overflow-hidden shadow-lg border border-border hover:shadow-2xl transition-all duration-300 flex flex-col"
                  >
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-text line-clamp-1 flex-1">
                          {item.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ml-2 ${
                          item.status === 'Merged' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          item.status === 'Closed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mb-4 line-clamp-3 flex-1">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {item.technologies.slice(0, 3).map((t, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium shadow-sm transition-all"
                            style={getTechStyle(t)}
                          >
                            {t}
                          </span>
                        ))}
                        {item.technologies.length > 3 && (
                          <span className="text-[10px] text-gray-400">
                            +{item.technologies.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <a
                          href={item.prUrl || item.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-bold text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faCodeBranch} /> View
                        </a>
                        <button
                          onClick={() => handleEdit(item)}
                          className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(item._id || item.id || null)}
                          className="w-10 h-10 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
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
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text hover:bg-primary hover:text-white disabled:opacity-30 transition-all group"
                  >
                    <FontAwesomeIcon
                      icon={faChevronLeft}
                      className="group-hover:-translate-x-0.5 transition-transform"
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
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text hover:bg-primary hover:text-white disabled:opacity-30 transition-all group"
                  >
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="group-hover:translate-x-0.5 transition-transform"
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
          <div className="bg-card w-full max-w-md p-6 rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2">Delete Contribution?</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this contribution? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 p-3 rounded-xl bg-secondary/50 font-bold hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => showDeleteModal && handleDelete(showDeleteModal)}
                className="flex-1 p-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
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
