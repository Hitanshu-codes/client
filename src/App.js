import React, { useState } from 'react';
import axios from 'axios';

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
    <div>
      <h1>Real-time Translator</h1>
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
  );
}

export default App;
