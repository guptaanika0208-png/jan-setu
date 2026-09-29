import { createContext, useContext, useState } from "react";

const VoiceAssistantContext = createContext(null);

export function VoiceAssistantProvider({ children }) {
  const [transcriptHistory, setTranscriptHistory] = useState([]); // [{role: 'user'|'assistant', text}]
  const [lastSpoken, setLastSpoken] = useState("");

  const pushMessage = (role, text) => {
    setTranscriptHistory((prev) => [...prev, { role, text, id: `${Date.now()}-${role}` }]);
    if (role === "assistant") setLastSpoken(text);
  };

  const reset = () => setTranscriptHistory([]);

  return (
    <VoiceAssistantContext.Provider value={{ transcriptHistory, pushMessage, lastSpoken, reset }}>
      {children}
    </VoiceAssistantContext.Provider>
  );
}

export const useVoiceAssistantContext = () => useContext(VoiceAssistantContext);
