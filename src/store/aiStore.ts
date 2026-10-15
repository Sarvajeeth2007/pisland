import { create } from 'zustand';
import { useSystemStore } from './systemStore';

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  codeSnippet?: string; // For code fix simulation
}

interface AIState {
  messages: AIMessage[];
  isThinking: boolean;
  voiceState: 'idle' | 'listening' | 'speaking';
  submitPrompt: (prompt: string) => void;
  triggerQuickAction: (actionId: string, customParam?: string) => void;
  startVoiceListening: () => void;
  stopVoiceListening: () => void;
  clearChat: () => void;
}

export const useAIStore = create<AIState>((set, get) => {
  const addMessage = (sender: 'user' | 'ai', text: string, codeSnippet?: string) => {
    const newMessage: AIMessage = {
      id: Math.random().toString(),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      codeSnippet
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
  };

  const simulateThinkingAndReply = (replyText: string, delay = 1500, codeSnippet?: string) => {
    set({ isThinking: true });
    
    // Simulate thinking state
    setTimeout(() => {
      set({ isThinking: false, voiceState: 'speaking' });
      addMessage('ai', replyText, codeSnippet);
      
      // Simulate speaking for 3 seconds then return to idle
      setTimeout(() => {
        set({ voiceState: 'idle' });
      }, 3000);
    }, delay);
  };

  return {
    messages: [
      {
        id: 'welcome',
        sender: 'ai',
        text: "Hello! I am Pi AI, your Windows companion. I can run system commands, search files, summarize your clipboard, or answer text and voice requests. How can I help you?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ],
    isThinking: false,
    voiceState: 'idle',

    submitPrompt: (prompt) => {
      if (!prompt.trim()) return;
      
      addMessage('user', prompt);
      
      const lower = prompt.toLowerCase();
      
      // Check for quick actions inside the text prompt
      if (lower.includes('mute')) {
        get().triggerQuickAction('mute');
        return;
      } else if (lower.includes('brightness') && (lower.includes('increase') || lower.includes('up') || lower.includes('higher'))) {
        get().triggerQuickAction('brightness-up');
        return;
      } else if (lower.includes('clipboard') || lower.includes('summarize')) {
        get().triggerQuickAction('summarize-clipboard');
        return;
      } else if (lower.includes('chrome')) {
        get().triggerQuickAction('open-chrome');
        return;
      } else if (lower.includes('fix code') || lower.includes('fix')) {
        get().triggerQuickAction('fix-code');
        return;
      } else if (lower.includes('email') || lower.includes('generate email')) {
        get().triggerQuickAction('generate-email');
        return;
      }

      // Default AI chat simulation responses
      let response = "I've analyzed your query. ";
      if (lower.includes('hello') || lower.includes('hi')) {
        response += "Greetings! I'm ready to assist with any Windows automation tasks you have.";
      } else if (lower.includes('weather')) {
        response += `The current weather is ${useSystemStore.getState().weather.temp}°C and ${useSystemStore.getState().weather.condition} in ${useSystemStore.getState().weather.location}.`;
      } else if (lower.includes('cpu') || lower.includes('stats')) {
        response += `Your system load is moderate. CPU usage is currently at ${useSystemStore.getState().cpuUsage}% and RAM usage is ${useSystemStore.getState().ramUsage}%.`;
      } else {
        response += "As a local desktop assistant, I can automate settings adjustments, manage your clipboard histories, or handle window configurations natively. Let me know if you would like me to toggle any features.";
      }

      simulateThinkingAndReply(response);
    },

    triggerQuickAction: (actionId, customParam) => {
      const systemStore = useSystemStore.getState();
      
      switch (actionId) {
        case 'mute':
          addMessage('user', 'Mute laptop');
          systemStore.setVolume(0);
          simulateThinkingAndReply("I have muted your speaker system.");
          break;

        case 'brightness-up':
          addMessage('user', 'Increase brightness');
          const newBright = Math.min(100, systemStore.brightness + 20);
          systemStore.setBrightness(newBright);
          simulateThinkingAndReply(`I have increased screen brightness to ${newBright}%.`);
          break;

        case 'summarize-clipboard':
          addMessage('user', 'Summarize my clipboard');
          const lastCopied = systemStore.clipboardHistory[0]?.text || '';
          if (!lastCopied) {
            simulateThinkingAndReply("Your clipboard history is currently empty, copy something first.");
          } else {
            simulateThinkingAndReply(
              `Here is a summary of your clipboard item ("${lastCopied.substring(0, 40)}..."): This text appears to be a development command/code snippet. Key parameters include standard packages. Let me know if you want me to execute or run it.`
            );
          }
          break;

        case 'explain-selected':
          addMessage('user', 'Explain selected text');
          const selectedText = customParam || "useSystemAPI() hook in React";
          simulateThinkingAndReply(
            `Analysis of selected text "${selectedText}":\nThis represents a custom React hook designed to bridge the UI components to native Tauri invoking actions or web-based fallback mock data engines. Highly clean, modular code.`
          );
          break;

        case 'open-chrome':
          addMessage('user', 'Open Chrome');
          systemStore.triggerNotification({
            type: 'bluetooth',
            title: 'Opening Application',
            subtitle: 'Google Chrome',
            duration: 3000
          });
          simulateThinkingAndReply("Launching Google Chrome... window should appear on your main desktop.");
          break;

        case 'fix-code':
          addMessage('user', 'Fix this TypeScript code');
          const codeFixed = `// Added explicit types for parameters and return statement\nfunction add(a: number, b: number): number {\n  return a + b;\n}`;
          simulateThinkingAndReply(
            "I've fixed your TypeScript code. Added explicit parameter and return typing constraints to avoid compiler warnings.",
            1800,
            codeFixed
          );
          break;

        case 'generate-email':
          addMessage('user', 'Generate professional email');
          const emailTemplate = `Subject: Project Update: Pisland Interface Scaffolding\n\nHi Team,\n\nI have successfully completed scaffolding the Pisland desktop interface widgets and notification configurations. Let me know if you have any questions.\n\nBest regards,\nDeveloper`;
          simulateThinkingAndReply(
            "I've compiled a professional email template. You can copy it directly from below.",
            1500,
            emailTemplate
          );
          break;

        case 'launch-copilot':
          addMessage('user', 'Launch Copilot');
          systemStore.triggerNotification({
            type: 'bluetooth',
            title: 'Launching Assistant',
            subtitle: 'Microsoft Copilot',
            duration: 2500
          });
          simulateThinkingAndReply("Invoking Microsoft Copilot desktop assistant.");
          break;

        case 'create-reminder':
          addMessage('user', 'Create reminder: Code review at 5 PM');
          systemStore.triggerNotification({
            type: 'bluetooth',
            title: 'Reminder Created',
            subtitle: 'Code review at 5:00 PM',
            duration: 3000
          });
          simulateThinkingAndReply("I've set a desktop reminder for your Code review at 5:00 PM today.");
          break;

        case 'translate':
          const textToTrans = customParam || "Bonjour, comment ça va?";
          addMessage('user', `Translate: "${textToTrans}"`);
          simulateThinkingAndReply(`Translation: "Hello, how is it going?" (Translated from French).`);
          break;

        case 'search-files':
          addMessage('user', 'Search for "index.css"');
          simulateThinkingAndReply(`Found 1 matching file in your local workspace:\n- [index.css](file:///d:/pisland/src/index.css)`);
          break;

        default:
          simulateThinkingAndReply("I received your action command but couldn't parse the target execution path.");
      }
    },

    startVoiceListening: () => {
      set({ voiceState: 'listening' });
      // Simulate hearing some speech after 2.5 seconds
      setTimeout(() => {
        if (get().voiceState === 'listening') {
          const simulatedSpeechList = [
            "summarize my clipboard",
            "increase screen brightness",
            "mute laptop sound",
            "open google chrome application",
            "explain selected text"
          ];
          const heard = simulatedSpeechList[Math.floor(Math.random() * simulatedSpeechList.length)];
          set({ voiceState: 'idle' });
          get().submitPrompt(heard);
        }
      }, 3000);
    },

    stopVoiceListening: () => {
      set({ voiceState: 'idle' });
    },

    clearChat: () => {
      set({ messages: [] });
    }
  };
});
