import React, { useState } from 'react';
import axios from 'axios';
// import { Mic, MicOff, Loader2, Volume2, HelpCircle } from "lucide-react"

function App() {
  const [text, setText] = useState('');
  const [translated, setTranslated] = useState('');
  const [language, setLanguage] = useState('es');
  const [aiSuggestions, setAiSuggestions] = useState([]);


  const handleAudioUpload = async (event) => {
    const formData = new FormData();
    formData.append('audio', event.target.files[0]);

    const response = await axios.post('https://talk-easy-ypxm.onrender.com/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    setText(response.data.text);
    console.log("Text set to " + response.data.text);

  };

  const handleTranslate = async () => {
    console.log("Call Made for Translation" + text);
    const response = await axios.post('https://talk-easy-ypxm.onrender.com/translate', {
      text: text,
      targetLang: language
    });
    const textObtained = await response.data.translatedText;

    setTranslated(textObtained);
    console.log("Translated Text set to " + textObtained);
  };
  const handleSuggestions = async () => {
    const response = await axios.post('https://talk-easy-ypxm.onrender.com/suggest', {
      text: text
    });
    const suggestions = await response.data.suggestions.suggestions;
    suggestions.map((suggestion) => {
      setAiSuggestions((prevSuggestions) => [...prevSuggestions, suggestion]);
    })
    console.log("Suggestions set to " + aiSuggestions);
  };

  return (
    <div className="container p-6">
      <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-2">Real-time Translator</h1>
          <p className="text-gray-600 mb-6">Speak into your microphone to get translations and suggestions</p>
          {/* <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex-1 px-4 py-2 rounded-md ${isRecording ? "bg-red-500" : "bg-blue-500"} text-white`}
            disabled={isProcessing}
          >
            {isRecording ? (
              <>
                <MicOff className="inline-block mr-2 h-4 w-4" /> Stop Recording
              </>
            ) : (
              <>
                <Mic className="inline-block mr-2 h-4 w-4" /> Start Recording
              </>
            )}
          </button> */}
          <input type="file" accept="audio/*" onChange={handleAudioUpload} />
          <p>Transcribed Text: {text}</p>
          <select onChange={(e) => setLanguage(e.target.value)}>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
            <option value="hi">Hindi</option>
          </select>
          <button onClick={handleTranslate}>Translate</button>
          <p>Translated Text: {translated}</p>
          <button onClick={handleSuggestions}>Get Suggestions</button>
          {aiSuggestions.map((suggestion, index) => (
            <p key={index}>{suggestion}</p> // New line for each suggestion
          ))}
        </div>
      </div>
    </div>

  );
}

export default App;
