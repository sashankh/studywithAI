import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ChatMessage, MCQQuestion, MCQEvaluation } from '../types/chat';
import { getChatResponse, generateMCQs, evaluateMCQs } from '../services/api';

interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
}

interface ChatContextType {
  messages: ChatMessage[];
  loading: boolean;
  isLoading: boolean;
  activeMCQ: MCQQuestion[] | null;
  mcqAnswers: string[];
  mcqEvaluation: MCQEvaluation | null;
  lastEvaluation: MCQEvaluation | null;
  chatHistory: Chat[];
  activeChat: Chat | null;
  activeChatId: string | null;
  sendMessage: (message: string) => Promise<void>;
  handleMCQAnswerChange: (index: number, answer: string) => void;
  submitMCQAnswers: (messageId?: string, answers?: string[]) => Promise<void>;
  startNewChat: () => void;
  setActiveChatId: (id: string) => void;
}

// Default chat history data
const defaultChatHistory: Chat[] = [
  { id: '1', title: 'Neural Networks Conversation', messages: [] },
  { id: '2', title: 'Solar System MCQs', messages: [] },
  { id: '3', title: 'Photosynthesis Quiz', messages: [] },
];

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeMCQ, setActiveMCQ] = useState<MCQQuestion[] | null>(null);
  const [mcqAnswers, setMcqAnswers] = useState<string[]>([]);
  const [mcqEvaluation, setMcqEvaluation] = useState<MCQEvaluation | null>(null);
  const [chatHistory] = useState<Chat[]>(defaultChatHistory);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  
  // Update the activeChat when activeChatId or messages change
  useEffect(() => {
    if (activeChatId) {
      const chat = chatHistory.find(chat => chat.id === activeChatId);
      if (chat) {
        setActiveChat(chat);
      }
    } else {
      // Create a temporary chat for current session
      setActiveChat({
        id: 'current',
        title: 'New Chat',
        messages: messages
      });
    }
  }, [activeChatId, messages, chatHistory]);

  const sendMessage = async (message: string) => {
    setLoading(true);
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Add "Thinking..." message immediately after user input
    const thinkingMessage: ChatMessage = {
      id: `thinking-${Date.now()}`,
      role: 'assistant',
      content: 'Thinking...',
      timestamp: new Date(),
      isStatusMessage: true  // Mark this as a status message
    };
    
    setMessages((prev) => [...prev, thinkingMessage]);
    
    try {
      const response = await getChatResponse(message);
      
      // Remove the "Thinking..." message
      setMessages((prev) => prev.filter(msg => msg.id !== thinkingMessage.id));
      
      // Add assistant's response to chat
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // If the response requires MCQs, generate them
      if (response.requires_mcq && response.mcq_topic) {
        // Add "Generating questions..." message
        const generatingMessage: ChatMessage = {
          id: `generating-${Date.now()}`,
          role: 'assistant',
          content: `Generating questions on topic ${response.mcq_topic}...`,
          timestamp: new Date(),
          isStatusMessage: true
        };
        
        setMessages((prev) => [...prev, generatingMessage]);
        
        const mcqResponse = await generateMCQs(response.mcq_topic);
        
        // Remove the "Generating questions..." message
        setMessages((prev) => prev.filter(msg => msg.id !== generatingMessage.id));
        
        setActiveMCQ(mcqResponse.questions);
        setMcqAnswers(Array(mcqResponse.questions.length).fill(''));
        setMcqEvaluation(null);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove the "Thinking..." and "Generating..." messages if they exist
      setMessages((prev) => prev.filter(msg => !msg.isStatusMessage));
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleMCQAnswerChange = (index: number, answer: string) => {
    setMcqAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[index] = answer;
      return newAnswers;
    });
  };

  const submitMCQAnswers = async (messageId?: string, answers?: string[]) => {
    if (!activeMCQ) return;
    
    setLoading(true);
    
    try {
      const answersToSubmit = answers || mcqAnswers;
      const evaluation = await evaluateMCQs(activeMCQ, answersToSubmit);
      setMcqEvaluation(evaluation);
      
      // Add evaluation message to chat
      const evaluationMessage: ChatMessage = {
        id: messageId || Date.now().toString(),
        role: 'assistant',
        content: `You scored ${evaluation.score}/${evaluation.total} (${evaluation.percentage.toFixed(2)}%)`,
        timestamp: new Date(),
        evaluation: evaluation,
      };
      
      setMessages((prev) => [...prev, evaluationMessage]);
      
      // Clear active MCQ after evaluation
      setActiveMCQ(null);
    } catch (error) {
      console.error('Error evaluating MCQs:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error evaluating your answers.',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveMCQ(null);
    setMcqAnswers([]);
    setMcqEvaluation(null);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        loading,
        isLoading: loading,
        activeMCQ,
        mcqAnswers,
        mcqEvaluation,
        lastEvaluation: mcqEvaluation,
        chatHistory,
        activeChat,
        activeChatId,
        sendMessage,
        handleMCQAnswerChange,
        submitMCQAnswers,
        startNewChat,
        setActiveChatId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};