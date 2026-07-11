import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import StatusAlert from "./common/StatusAlert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faLocationDot,
  faPaperPlane,
  faCheckCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";

const ContactInfoItem = ({ icon, label, value, href, dir }) => (
  <div dir={dir} className="flex items-start gap-4 p-4 border border-border bg-card hover:border-primary transition-colors duration-150 group">
    <div className="w-12 h-12 border border-primary/20 bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
      <FontAwesomeIcon icon={icon} />
    </div>
    <div className="flex flex-col text-start" >
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
      {href ? (
        <a href={href} className="text-text font-semibold hover:text-primary transition-colors"  >
          {value}
        </a>
      ) : (
        <span className="text-text font-semibold">{value}</span>
      )}
    </div>
  </div>
);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Contact = () => {
  const { isArabic } = useLanguage();
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    subject: "general-inquiry",
    message: "",
  });

  const [status, setStatus] = useState({ type: null, message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to send message. Please try again later.");

      setStatus({ type: "success", message: isArabic ? "تم إرسال الرسالة! سأعود إليك قريباً." : "Message sent! I'll get back to you soon." });
      setFormData({
        fname: "",
        lname: "",
        email: "",
        phone: "",
        subject: "general-inquiry",
        message: "",
      });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus({ type: null, message: "" }), 5000);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 ms-4 md:ms-0 text-center md:text-start">
          <h2
            className="text-primary text-xs font-bold uppercase tracking-wide mb-4 flex items-center justify-center md:justify-start gap-3 before:content-[''] before:w-8 before:h-[1px] before:bg-primary/30"
            id="contact"
          >
            {isArabic ? "تواصل" : "Connect"}
          </h2>
          <h3 className="text-4xl font-extrabold text-text leading-tight">
            {isArabic ? (<>تواصل <span className="text-primary">معي</span></>) : (<>Get <span className="text-primary">In Touch</span></>)}
          </h3>
          <p className="text-text mt-4 mx-auto md:mx-0 max-w-xl text-lg font-medium">
            {isArabic ? "هل لديك مشروع في ذهنك أو تريد فقط أن تلقي التحية؟ لا تتردد في التواصل." : "Have a project in mind or just want to say hi? Feel free to reach out."}
          </p>
        </div>

        <section
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          aria-labelledby="contact"
        >
          <div className="lg:col-span-4 space-y-4 order-2 lg:order-1">
            <ContactInfoItem 
              icon={faPhone} 
              dir={isArabic ? "rtl" : "ltr"}
              label={isArabic ? "الهاتف" : "Phone"} 
              value={isArabic ? "+972 568973379" : "+972 568973379"}
              href="tel:+972568973379" 
            />
            <ContactInfoItem 
              icon={faEnvelope} 
              label={isArabic ? "البريد الإلكتروني" : "Email"} 
              value="hasansaafen1234@gmail.com" 
              href="mailto:hasansaafen1234@gmail.com" 
            />
            <ContactInfoItem 
              icon={faLocationDot} 
              label={isArabic ? "الموقع" : "Location"} 
              value={isArabic ? "الخليل، فلسطين" : "Hebron, Palestine"} 
            />

            <div className="p-8 bg-primary text-white mt-8">
              <h3 className="text-xl font-bold mb-4">{isArabic ? "الملفات الاجتماعية" : "Social Profiles"}</h3>
              <div className="flex flex-col gap-4">
                <a
                  href="https://linkedin.com/in/hasan-saafen-9ba5902b5"
                  target="_blank"
                  className="flex items-center gap-3 hover:text-blue-200 transition-colors"
                >
                  <FontAwesomeIcon icon={faLinkedin} className="text-xl" />
                  <span className="font-medium">Hasan Al-Saafin</span>
                </a>
                <a
                  href="https://github.com/HasanAlsaafen"
                  target="_blank"
                  className="flex items-center gap-3 hover:text-blue-200 transition-colors"
                >
                  <FontAwesomeIcon icon={faGithub} className="text-xl" />
                  <span className="font-medium">HasanAlsaafen</span>
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 order-1 lg:order-2">
            <form
              className="bg-card p-8 md:p-12 border border-border text-text"
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 ">
                <div className="space-y-2 text-start">
                  <label className="text-xs font-bold  uppercase tracking-wider" htmlFor="fname">
                    {isArabic ? "الاسم الأول" : "First Name"}
                  </label>
                  <input
                    type="text"
                    id="fname"
                    name="fname"
                    placeholder={isArabic ? "حسن" : "Hasan"}
                    value={formData.fname}
                    onChange={handleChange}
                    className="w-full bg-card border border-border p-4 text-sm focus:outline focus:outline-2 focus:outline-primary focus:border-primary transition-colors outline-none"
                    required
                  />
                </div>
                <div className="space-y-2 text-start">
                  <label className="text-xs font-bold uppercase tracking-wider" htmlFor="lname">
                    {isArabic ? "الاسم الأخير" : "Last Name"}
                  </label>
                  <input
                    type="text"
                    id="lname"
                    name="lname"
                    placeholder={isArabic ? "السعافين" : "Al-Saafin"}
                    value={formData.lname}
                    onChange={handleChange}
                    className="w-full bg-card border border-border p-4 text-sm focus:outline focus:outline-2 focus:outline-primary focus:border-primary transition-colors outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2 text-start">
                  <label className="text-xs font-bold uppercase tracking-wider" htmlFor="email">
                    {isArabic ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-card border border-border p-4 text-sm focus:outline focus:outline-2 focus:outline-primary focus:border-primary transition-colors outline-none"
                    required
                  />
                </div>
                <div className="space-y-2 text-start">
                  <label className="text-xs font-bold uppercase tracking-wider" htmlFor="phone">
                    {isArabic ? "رقم الهاتف" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="+972 ..."
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-card border border-border p-4 text-sm focus:outline focus:outline-2 focus:outline-primary focus:border-primary transition-colors outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6 text-start">
                <label className="text-xs font-bold uppercase tracking-wider">
                  {isArabic ? "اختر الموضوع" : "Select Subject"}
                </label>
                <div className="flex flex-wrap gap-3">
                  
                  {["General Inquiry", "Project Proposal", "Feedback"].map((option) => (
                    <label key={option} className="cursor-pointer">
                      <input
                        type="radio"
                        name="subject"
                        value={option.toLowerCase().replace(" ", "-")}
                        checked={formData.subject === option.toLowerCase().replace(" ", "-")}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="px-4 py-2 bg-card text-xs font-semibold text-gray-500 dark:text-gray-400 peer-checked:bg-primary peer-checked:text-white transition-colors border border-border peer-checked:border-primary">
                        {option}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mb-8 text-start">
                <label className="text-xs font-bold uppercase tracking-wider" htmlFor="message">
                  {isArabic ? "كيف يمكنني مساعدتك؟" : "How can I help you?"}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder={isArabic ? "كيف يمكنني مساعدتك؟" : "How can I help you?"}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-card border border-border p-4 text-sm focus:outline focus:outline-2 focus:outline-primary focus:border-primary transition-colors outline-none resize-none"
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-primary text-white font-semibold py-4 px-10 hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] disabled:opacity-50 transition-colors duration-150 flex items-center justify-center gap-3 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {loading ? (isArabic ? "جاري الإرسال..." : "Sending...") : (isArabic ? "إرسال الرسالة" : "Send Message")}
                  <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
                </button>
              </div>

              {status.type && (
                <StatusAlert 
                  type={status.type} 
                  message={status.message} 
                  onClose={() => setStatus({ type: null, message: "" })} 
                />
              )}
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;

