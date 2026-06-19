import { useState, useRef, useEffect } from "react";
import axios from "axios";
import LOGO_SRC from "../assets/Your Health Companion.jpg";

const api = axios.create({ baseURL: "http://localhost:8000" });

const LANGUAGES = [
  "English","Hindi","Tamil","Telugu","Kannada",
  "Malayalam","Bengali","Marathi","Gujarati","Punjabi",
];

const WELCOME = {
  id: 1, role: "assistant",
  text: "Hello! I'm here to assist you with diabetic foot ulcers. Share a question or upload a foot image.",
  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function TypingDots() {
  return (
    <div className="flex gap-1 px-4 py-3">
      {[0,1,2].map(i => (
        <span key={i} className="w-2 h-2 rounded-full bg-blue-300 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full overflow-hidden mr-2 mt-1 shrink-0 border-2 border-white/10 bg-slate-600">
        <img src={LOGO_SRC} alt="MediAssist" className="w-full h-full object-cover scale-150" />
        </div>
      )}
      <div className={`max-w-[78%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        {msg.imagePreview && (
          <img src={msg.imagePreview} alt="upload"
            className="mb-1 max-w-[180px] max-h-[140px] object-cover rounded-xl border border-white/10" />
        )}
        {msg.text && (
          <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
            isUser
              ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white font-sans rounded-tr-sm"
              : "bg-[#1e2a3a] text-slate-100 rounded-tl-sm border border-white/5"
          }`}>
            {msg.text}
          </div>
        )}
        <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
      </div>
    </div>
  );
}

export default function ChatBot({ onClose }) {
  const [isOpen, setIsOpen]       = useState(true);
  const [messages, setMessages]   = useState([WELCOME]);
  const [input, setInput]         = useState("");
  const [language, setLanguage]   = useState("English");
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [loading, setLoading]     = useState(false);

  const bottomRef  = useRef(null);
  const fileRef    = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const pickFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const addMessage = (role, text, imagePreview = null) =>
    setMessages(prev => [...prev, { id: Date.now(), role, text, imagePreview, time: now() }]);

  // send message to backend
  const sendMessage = async () => {
    const text = input.trim();
    if (!text && !file) return;

    addMessage("user", text || null, preview);
    setInput("");
    setLoading(true);

    try {
      const form = new FormData();
      form.append("language", language);

      if (file) {
        form.append("file", file);
        form.append("is_image_check", "true");
        if (text) form.append("question", text);
      } else {
        const q = text.toLowerCase().includes("foot ulcer") ? text : `${text} (about foot ulcer)`;
        form.append("question", q);
        form.append("is_image_check", "false");
      }
      clearFile();

      const { data } = await api.post("/chat", form);

      const label = data.label ? `\n\n🔍 Detection: ${data.label.toUpperCase()}` : "";
      addMessage("assistant", (data.message || "") + label);

    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Something went wrong";
      addMessage("assistant", `${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-50">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H5l-4 4V6a2 2 0 012-2h16a2 2 0 012 2v10z" />
      </svg>
    </button>
  );

  return (
    <div className="fixed bottom-6 right-6 w-[380px] max-h-[620px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0f1824] z-50">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#141f2e] border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-white/10 bg-slate-600">
           <img src={LOGO_SRC} alt="MediAssist Logo" className="w-full h-full object-cover scale-150" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white text-large font-sans font-semibold">MediAssist</span>
              <span className="text-[12px] bg-blue-500/20 text-white border border-blue-500/30 px-2 py-0.5 rounded-full">
                {language}
              </span>
            </div>
            <p className="text-slate-300 font-sans text-[13px]">Your AI-Powered Healthcare Assistant</p>
          </div>
        </div>
        <button onClick={() => { setIsOpen(false); onClose?.(); }}
          className="text-slate-400 hover:text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto  text-white text-sm font-poppins px-4 py-4 space-y-1" style={{ maxHeight: "420px" }}>
        {messages.map(msg => <Message key={msg.id} msg={msg} />)}
        {loading && (
          <div className="flex justify-start mb-3">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-white/10">
                <img src={LOGO_SRC} alt="MediAssist" className="w-full h-full object-cover scale-150" />
              </div>
            <div className="bg-[#1e2a3a] rounded-2xl rounded-tl-sm border border-black/20 shadow-md ml-3">
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Image preview */}
      {preview && (
        <div className="px-4 pb-2 flex items-center gap-2">
          <div className="relative">
            <img src={preview} alt="preview" className="w-14 h-14 object-cover rounded-lg border border-white/10" />
            <button onClick={clearFile}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center hover:bg-red-600">
              ×
            </button>
          </div>
          <span className="text-slate-300 text-xs">Image ready to send</span>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 bg-[#141f2e] border-t border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-slate-300 font-poppins text-sm">Language:</label>
          <select value={language} onChange={e => setLanguage(e.target.value)}
            className="flex-1 bg-[#0f1824] text-slate-200 text-sm border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500/50">
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div className="flex items-end gap-2 bg-[#1e2a3a] rounded-xl border border-white/10 px-3 py-2 focus-within:border-blue-500/40 transition-colors">
          {/* Attach */}
          <button onClick={() => fileRef.current?.click()}
            className="text-slate-300 hover:text-blue-400 transition-colors shrink-0 mb-0.5" title="Attach image">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />

          {/* Text */}
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown}
            placeholder="Ask about foot ulcers..." rows={1}
            className="flex-1 bg-transparent text-white font-poppins text-sm placeholder-white resize-none focus:outline-none leading-relaxed max-h-24 overflow-y-auto"
            style={{ scrollbarWidth: "none" }} />

          {/* Send */}
          <button onClick={sendMessage} disabled={loading || (!input.trim() && !file)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-md">
            <svg className="w-3.5 h-3.5 rotate-45 -translate-y-px translate-x-px" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-white font-poppins text-[11px] mt-1.5">Not a substitute for professional medical advice</p>
      </div>
    </div>
  );
}