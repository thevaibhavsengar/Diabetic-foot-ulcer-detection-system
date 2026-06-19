import { useState } from "react";
import UI from "./components/UI";
import Chat from "./components/chat";
import Map from "./components/Map";

export default function App() {
  const [language, setLanguage] = useState("English");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div className="min-h-screen  bg-gradient-to-br from-slate-950 via-slate-890 to-blue-900 text-white font-sans">

      <UI
        language={language}
        toggleLanguage={setLanguage}
        uploadedImage={uploadedImage}
        setUploadedImage={setUploadedImage}
        prediction={prediction}
        setPrediction={setPrediction}
        setChatOpen={setChatOpen}
      />

      {/* Nearby Hospitals Map — opens when button is clicked */}
      {mapOpen && <Map onClose={() => setMapOpen(false)} />}


      {!mapOpen && (
        <button
          onClick={() => setMapOpen(!mapOpen)}
          className="fixed bottom-20 right-6 w-50 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl shadow-xl hover:shadow-3xl hover:scale-105 transition-all duration-200 font-sans font-medium"
        >
          🏥 Nearby Hospitals
        </button>
      )}

      {/* Chat Button — bottom-right */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="fixed bottom-6 right-6 w-50 bg-gradient-to-r  from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl shadow-md hover:shadow-2xl hover:scale-105 transition-all duration-200 text-medium font-sans font-semibold z-50"
        >
          💬 {language === "English" ? "Chat with AI" : "AI से चैट करें"}

        </button>
      )}

      {/* Chat Widget */}
      {chatOpen && (
        <Chat
          language={language}
          uploadedImage={uploadedImage}
          onClose={() => setChatOpen(false)}
        />
      )}

    </div>
  );
}