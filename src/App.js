import React, { useState, useRef } from "react";
import axios from "axios";

function App() {
  const [text, setText] = useState("");
  const [translated, setTranslated] = useState("");
  const [language, setLanguage] = useState("es");
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 🎤 Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];
        await sendAudioToBackend(audioBlob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // ⏹️ Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 📤 Send recorded audio to backend
  const sendAudioToBackend = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.webm");

    try {
      const response = await axios.post("https://talk-easy-ypxm.onrender.com/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setText(response.data.text);
      console.log("Text set to:", response.data.text);
    } catch (error) {
      console.error("Error sending audio:", error);
    }
  };

  // 📂 Handle File Upload
  const handleAudioUpload = async (event) => {
    const formData = new FormData();
    formData.append("audio", event.target.files[0]);

    try {
      const response = await axios.post("https://talk-easy-ypxm.onrender.com/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setText(response.data.text);
      console.log("Text set to:", response.data.text);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  // 🌍 Translate Text
  const handleTranslate = async () => {
    console.log("Call Made for Translation:", text);
    const response = await axios.post("https://talk-easy-ypxm.onrender.com/translate", {
      text: text,
      targetLang: language,
    });

    setTranslated(response.data.translatedText);
    console.log("Translated Text set to:", response.data.translatedText);
  };

  // 🤖 Get AI Suggestions
  const handleSuggestions = async () => {
    const response = await axios.post("https://talk-easy-ypxm.onrender.com/suggest", {
      text: text,
    });

    setAiSuggestions(response.data.suggestions.suggestions);
    console.log("Suggestions set to:", response.data.suggestions.suggestions);
  };

  return (
    <div className="container p-6">
      <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-2">Real-time Translator</h1>
          <p className="text-gray-600 mb-6">Speak into your microphone to get translations and suggestions</p>

          {/* 🎤 Microphone Recording */}
          <button onClick={isRecording ? stopRecording : startRecording} className={`px-4 py-2 rounded-md ${isRecording ? "bg-red-500" : "bg-blue-500"} text-white`}>
            {isRecording ? "⏹️ Stop Recording" : "🎤 Start Recording"}
          </button>

          {/* 📂 File Upload */}
          <input type="file" accept="audio/*" onChange={handleAudioUpload} className="mt-4 p-4 text-gray-600 " />

          {/* 📝 Transcribed Text */}
          <p className="mt-4 p-5"><strong>Transcribed Text:</strong> {text}</p>

          {/* 🌎 Translation */}
          <select onChange={(e) => setLanguage(e.target.value)} className="mt-2">
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
            <option value="hi">Hindi</option>
            <option value="en">English</option>
          </select>
          <button onClick={handleTranslate} className="ml-2 px-4 py-2 bg-green-500 text-white rounded">Translate</button>
          <p className="mt-4"><strong>Translated Text:</strong> {translated}</p>

          {/* 🤖 AI Suggestions */}
          <button onClick={handleSuggestions} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Get Suggestions</button>
          <div className="mt-4">
            {aiSuggestions.map((suggestion, index) => (
              <p key={index}>⭐ {suggestion}</p> // Each suggestion on a new line
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
