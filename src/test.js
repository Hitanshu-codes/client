"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Loader2, Volume2, HelpCircle } from "lucide-react"

const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "ja", name: "Japanese" },
]

export default function Home() {
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState("")
    const [error, setError] = useState("")
    const [sourceLanguage, setSourceLanguage] = useState("en")
    const [targetLanguage, setTargetLanguage] = useState("es")
    const [volume, setVolume] = useState(0)
    const [history, setHistory] = useState < string[] > ([])
    const [autoDetectLanguage, setAutoDetectLanguage] = useState(true)
    const [activeTab, setActiveTab] = useState("translate")
    const mediaRecorder = useRef < MediaRecorder | null > (null)
    const audioContext = useRef < AudioContext | null > (null)
    const analyser = useRef < AnalyserNode | null > (null)

    useEffect(() => {
        return () => {
            if (audioContext.current) {
                audioContext.current.close()
            }
        }
    }, [])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaRecorder.current = new MediaRecorder(stream)

            audioContext.current = new AudioContext()
            analyser.current = audioContext.current.createAnalyser()
            const source = audioContext.current.createMediaStreamSource(stream)
            source.connect(analyser.current)

            const updateVolume = () => {
                if (analyser.current) {
                    const dataArray = new Uint8Array(analyser.current.frequencyBinCount)
                    analyser.current.getByteFrequencyData(dataArray)
                    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
                    setVolume(average)
                }
                if (isRecording) {
                    requestAnimationFrame(updateVolume)
                }
            }

            mediaRecorder.current.ondataavailable = () => {
                // In a real app, we would save the audio data here
            }

            mediaRecorder.current.onstop = () => {
                setIsProcessing(true)
                // Simulate processing delay
                setTimeout(() => {
                    const newResult = `Transcription: Hello, world!\nTranslation: Hola, mundo!\nSuggestions: Consider using "¡Hola!" for emphasis.`
                    setResult(newResult)
                    setHistory((prev) => [newResult, ...prev.slice(0, 4)])
                    setIsProcessing(false)
                }, 2000)
            }

            mediaRecorder.current.start()
            setIsRecording(true)
            setError("")
            updateVolume()
        } catch (err) {
            console.error("Error accessing microphone:", err)
            setError("Unable to access microphone. Please check your permissions.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorder.current) {
            mediaRecorder.current.stop()
            setIsRecording(false)
            setVolume(0)
        }
    }

    return (
        <div className="container mx-auto p-4">
            <div className="w-full max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-2">Voice Translator and Suggester</h1>
                    <p className="text-gray-600 mb-6">Speak into your microphone to get translations and suggestions</p>

                    <div className="mb-6">
                        <div className="flex space-x-2 mb-4">
                            <button
                                onClick={() => setActiveTab("translate")}
                                className={`px-4 py-2 rounded-md ${activeTab === "translate" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                            >
                                Translate
                            </button>
                            <button
                                onClick={() => setActiveTab("history")}
                                className={`px-4 py-2 rounded-md ${activeTab === "history" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                            >
                                History
                            </button>
                            <button
                                onClick={() => setActiveTab("settings")}
                                className={`px-4 py-2 rounded-md ${activeTab === "settings" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                            >
                                Settings
                            </button>
                        </div>

                        {activeTab === "translate" && (
                            <div className="space-y-4">
                                <div className="flex space-x-4">
                                    <select
                                        value={sourceLanguage}
                                        onChange={(e) => setSourceLanguage(e.target.value)}
                                        disabled={autoDetectLanguage}
                                        className="w-1/2 p-2 border rounded-md"
                                    >
                                        {languages.map((lang) => (
                                            <option key={lang.code} value={lang.code}>
                                                {lang.name}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={targetLanguage}
                                        onChange={(e) => setTargetLanguage(e.target.value)}
                                        className="w-1/2 p-2 border rounded-md"
                                    >
                                        {languages.map((lang) => (
                                            <option key={lang.code} value={lang.code}>
                                                {lang.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button
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
                                    </button>
                                    <div className="flex items-center">
                                        <Volume2 className="h-4 w-4 mr-2" />
                                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{ width: `${(volume / 255) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                {isProcessing && (
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing audio...
                                    </div>
                                )}
                                {error && <div className="text-red-500 text-sm">{error}</div>}
                                {result && (
                                    <div className="mt-4 p-4 bg-gray-100 rounded-md">
                                        <h3 className="font-semibold mb-2">Result:</h3>
                                        <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "history" && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Translation History</h3>
                                {history.length > 0 ? (
                                    history.map((item, index) => (
                                        <div key={index} className="p-2 bg-gray-100 rounded-md">
                                            <pre className="whitespace-pre-wrap text-sm">{item}</pre>
                                        </div>
                                    ))
                                ) : (
                                    <p>No translation history yet.</p>
                                )}
                            </div>
                        )}

                        {activeTab === "settings" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="auto-detect"
                                            checked={autoDetectLanguage}
                                            onChange={(e) => setAutoDetectLanguage(e.target.checked)}
                                            className="rounded"
                                        />
                                        <label htmlFor="auto-detect">Auto-detect source language</label>
                                    </div>
                                    <div className="relative group">
                                        <HelpCircle className="h-4 w-4" />
                                        <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 right-0 mt-1">
                                            Automatically detect the language being spoken
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block mb-2">Microphone Sensitivity</label>
                                    <input type="range" min="0" max="100" defaultValue="50" className="w-full" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

