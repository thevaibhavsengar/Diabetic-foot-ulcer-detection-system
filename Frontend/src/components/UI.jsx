import { useRef, useState } from "react";
import axios from "axios";



const t = {
  English: {
    title: "Diabetic Foot Ulcer Prediction with AI Assistance",
    subtitle: "Upload a foot image for early ulcer detection and personalized healthcare guidance.",
    dragDrop: "Drag & Drop or Click to Upload",
    predictionUlcer: "Prediction: Ulcer is present",
    predictionNormal: "Prediction: Normal (Healthy Skin)",
    analyzing: "Analyzing image...",
    chatPrompt: "Open chat to ask the MediAssist about this image →",
  },
  Hindi: {
    title: "फुट अल्सर भविष्यवाणी और एआई सहायता",
    subtitle: "एआई-पावर्ड अल्सर डिटेक्शन के लिए एक छवि अपलोड करें और जानकारी के लिए चेट करें।",
    dragDrop: "ड्रैग और ड्रॉप करें या अपलोड करने के लिए क्लिक करें",
    predictionUlcer: "भविष्यवाणी: अल्सर मौजूद है",
    predictionNormal: "भविष्यवाणी: सामान्य (स्वस्थ त्वचा)",
    analyzing: "छवि का विश्लेषण हो रहा है...",
    chatPrompt: "इस छवि के बारे में AI से पूछने के लिए चैट खोलें →",
  },
  Marathi: {
  title: "पायातील अल्सर भविष्यवाणी आणि AI सहाय्य",
  subtitle: "AI-सक्षम अल्सर शोधण्यासाठी एक प्रतिमा अपलोड करा आणि माहितीसाठी चॅट करा.",
  dragDrop: "ड्रॅग आणि ड्रॉप करा किंवा अपलोड करण्यासाठी क्लिक करा",
  predictionUlcer: "भविष्यवाणी: अल्सर उपस्थित आहे",
  predictionNormal: "भविष्यवाणी: सामान्य (निरोगी त्वचा)",
  analyzing: "प्रतिमेचे विश्लेषण केले जात आहे...",
  chatPrompt: "या प्रतिमेबद्दल AI ला विचारण्यासाठी चॅट उघडा →"
},
Tamil: {
  title: "கால் புண் கணிப்பு மற்றும் AI உதவி",
  subtitle: "AI ஆதரவு புண் கண்டறிதலுக்காக ஒரு படத்தை பதிவேற்றவும் மற்றும் தகவலுக்கு அரட்டையாடவும்.",
  dragDrop: "இழுத்து விடவும் அல்லது பதிவேற்ற கிளிக் செய்யவும்",
  predictionUlcer: "கணிப்பு: புண் உள்ளது",
  predictionNormal: "கணிப்பு: சாதாரணம் (ஆரோக்கியமான தோல்)",
  analyzing: "படம் பகுப்பாய்வு செய்யப்படுகிறது...",
  chatPrompt: "இந்த படத்தைப் பற்றி AI-யிடம் கேட்க அரட்டை திறக்கவும் →"
},
Telugu: {
  title: "పాద గాయం అంచనా మరియు AI సహాయం",
  subtitle: "AI ఆధారిత గాయం గుర్తింపుకోసం ఒక చిత్రాన్ని అప్‌లోడ్ చేసి సమాచారం కోసం చాట్ చేయండి.",
  dragDrop: "డ్రాగ్ చేసి వదలండి లేదా అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి",
  predictionUlcer: "అంచనా: గాయం ఉంది",
  predictionNormal: "అంచనా: సాధారణం (ఆరోగ్యకరమైన చర్మం)",
  analyzing: "చిత్రాన్ని విశ్లేషిస్తోంది...",
  chatPrompt: "ఈ చిత్రంపై AI ని అడగడానికి చాట్ తెరవండి →"
}

};

export default function Landingpage({
  language,
  toggleLanguage,
  uploadedImage,
  setUploadedImage,
  prediction,
  setPrediction,
  setChatOpen,
}) {
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const tx = t[language];

  const handleFile = async (file) => {

  if (!file || !file.type.startsWith("image/")) return;

  const reader = new FileReader();

  reader.onload = async (e) => {

    const base64 = e.target.result;

    setUploadedImage(base64);

    setPrediction(null);

    setAnalyzing(true);

    try {

      const formData = new FormData();

      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:8000/predict",
        formData
      );

      const result = response.data.prediction;
      if (result === 0) {
        setPrediction("ulcer");
      } else {
        setPrediction("normal");
      }

    } catch (error) {

      console.log(error);

    } finally {

      setAnalyzing(false);
    }
  };

  reader.readAsDataURL(file);
};

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const onFileChange = (e) => handleFile(e.target.files[0]);

  const removeImage = () => {
    setUploadedImage(null);
    setPrediction(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      {/* Title */}
      <div className="flex flex-col items-center justify-center gap-3 mb-5">
      <img src="/logo.png" alt="logo" className="w-25 h-25 object-contain" />
      <h1 className="text-5xl md:text-5xl font-bold font-inter text-center mb-1 bg-gradient-to-br from-blue-200 to-purple-300 bg-clip-text text-transparent leading-tight">
        {tx.title}
      </h1>
      </div>
      <p className="text-gray-200 text-center max-w-md mb-8 font-semibold text-medium font-sans">
        {tx.subtitle}
      </p>

      {/* Upload card */}
      <div className="w-full max-w-md bg-[#1a2340] rounded-2xl p-4 shadow-xl border border-[#2a3455]">
        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all
            ${dragging ? "border-blue-400 bg-blue-900/20" : "border-[#3a4465] hover:border-blue-300 hover:bg-[#1e2d4a]"}`}
        >
          {/* Upload icon */}
          <svg className="w-12 h-12 text-gray-100 font-inter mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0-3 3m3-3 3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32 4.5 4.5 0 0 1 4.068 4.59c0 2.485-2.014 4.5-4.5 4.5H6.75Z" />
          </svg>
          <p className="text-gray-200 text-medium font-medium font-inter">{tx.dragDrop}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        {/* Preview + prediction */}
        {uploadedImage && (
          <div className="mt-4 relative rounded-xl overflow-hidden border border-[#2a3455]">
            <img src={uploadedImage} alt="uploaded" className="w-full object-cover max-h-64" />
            {/* Remove button */}
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-white/20 hover:bg-white/10 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shadow"
            >
              ✕
            </button>
            {/* Prediction badge */}
            <div className="py-3 text-center bg-[#1a2340]">
              {analyzing ? (
                <span className="text-blue-100 font-poppins text-medium animate-pulse">{tx.analyzing}</span>
              ) : prediction === "ulcer" ? (
                <span className="font-semibold font-inter text-red-400">{tx.predictionUlcer}</span>
              ) : prediction === "normal" ? (
                <span className="font-semibold font-inter text-green-400">{tx.predictionNormal}</span>
              ) : null}
            </div>
          </div>
        )}

       
        {prediction && (
          <button
            onClick={() => setChatOpen(true)}
            className="mt-3 w-full text-center text-sm font-inter text-blue-200 hover:text-white transition-colors"
          >
            {tx.chatPrompt}
          </button>
          
        )}
      </div>

        <div className="mt-7">
    <select
    value={language}
    onChange={(e) => toggleLanguage(e.target.value)}
    className="px-3 py-2 rounded-xl bg-[#1a2340] justify-between border border-gray-500 text-gray-100 font-inter text-medium focus:border-blue-400 outline-none"
    >
    <option value="English">English</option>
    <option value="Hindi">हिन्दी</option>
    <option value="Marathi">मराठी</option>
    <option value="Tamil">தமிழ்</option>
    <option value="Telugu">తెలుగు</option>
    <option value="Kannada">ಕನ್ನಡ</option>
    <option value="Bengali">বাংলা</option>
    <option value="Gujarati">ગુજરાતી</option>
    <option value="Punjabi">ਪੰਜਾਬੀ</option>
    <option value="Malayalam">മലയാളം</option>
    </select>
    </div>
    </div>
  );
}
