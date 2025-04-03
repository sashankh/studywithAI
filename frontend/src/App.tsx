import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatHistory, ChatPanel } from './components/Chat';
import { MCQCard } from './components/MCQ';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { ChatSession, Message, MCQQuiz, MCQQuestion, MCQOption } from './types';
import { sendMessage, requestMCQs } from './services/api';
import './App.css';

// Define a new type that extends Message to include MCQ data
interface MCQMessage extends Message {
  mcqQuiz?: MCQQuiz;
}

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with a default session
  useEffect(() => {
    const defaultSession = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
    };
    setSessions([defaultSession]);
    setCurrentSessionId(defaultSession.id);
  }, []);

  // Get current session
  const currentSession = sessions.find(session => session.id === currentSessionId) || {
    id: '',
    title: '',
    messages: [],
  };

  // Handle creating a new chat session
  const handleNewChat = () => {
    const newSession = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
    };
    setSessions([...sessions, newSession]);
    setCurrentSessionId(newSession.id);
    setError(null);
  };

  // Handle changing the current session
  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setError(null);
  };

  // Check if a message contains an MCQ request
  const isMCQRequest = (message: string): boolean => {
    const mcqPatterns = [
      /generate.*mcqs?/i,
      /create.*mcqs?/i,
      /make.*mcqs?/i,
      /multiple choice questions?/i,
      /quiz/i,
      /test me/i,
    ];
    return mcqPatterns.some(pattern => pattern.test(message));
  };

  // Extract topic from MCQ request
  const extractTopicFromMCQRequest = (message: string): string => {
    const match = message.match(/(?:on|about|for|regarding)\s+(.+?)(?:\s+with|\s+having|\s+containing|\s*$)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    
    const fallbackMatch = message.match(/(?:mcqs?|quiz|multiple choice questions?)\s+(?:on|about|for|regarding)?\s*(.+)/i);
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1].trim();
    }
    
    return 'General Knowledge';
  };

  // Transform backend MCQ data to match frontend expected format
  const transformMCQData = (backendData: any): MCQQuiz => {
    console.log('Transforming MCQ data:', backendData);

    const formattedQuiz: MCQQuiz = {
      id: uuidv4(),
      topic: backendData.topic || 'Quiz',
      questions: []
    };

    if (backendData.questions && Array.isArray(backendData.questions)) {
      formattedQuiz.questions = backendData.questions.map((q: any) => {
        const options: MCQOption[] = [];
        if (q.options && typeof q.options === 'object') {
          Object.entries(q.options).forEach(([key, value]) => {
            options.push({
              id: key,
              text: value as string
            });
          });
        }

        const question: MCQQuestion = {
          id: uuidv4(),
          question: q.question || 'Question',
          options: options,
          correctAnswerId: q.correct_answer || '',
          explanation: q.explanation || ''
        };

        return question;
      });
    }

    console.log('Transformed quiz:', formattedQuiz);
    return formattedQuiz;
  };

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const updatedSessions = sessions.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: [
            ...session.messages,
            userMessage,
          ],
        };
      }
      return session;
    });

    setSessions(updatedSessions);

    try {
      if (isMCQRequest(content)) {
        const topic = extractTopicFromMCQRequest(content);
        
        const assistantMessage: MCQMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: `Here are some multiple choice questions on ${topic}:`,
          timestamp: new Date(),
        };

        try {
          const mcqResponse = await requestMCQs(topic);
          console.log('Raw MCQ response:', mcqResponse);
          
          const formattedQuiz = transformMCQData(mcqResponse);
          
          assistantMessage.mcqQuiz = formattedQuiz;
          
          const updatedSessionsWithMCQ = sessions.map(session => {
            if (session.id === currentSessionId) {
              return {
                ...session,
                messages: [
                  ...session.messages,
                  userMessage,
                  assistantMessage
                ],
              };
            }
            return session;
          });
          
          setSessions(updatedSessionsWithMCQ);
        } catch (error) {
          console.error('Error processing MCQs:', error);
          throw error;
        }
      } else {
        const response = await sendMessage(content);

        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: response.message || response.content || "I'm not sure how to respond to that.",
          timestamp: new Date(),
        };

        const updatedSessionsWithResponse = sessions.map(session => {
          if (session.id === currentSessionId) {
            return {
              ...session,
              messages: [
                ...session.messages,
                userMessage,
                assistantMessage
              ],
            };
          }
          return session;
        });

        setSessions(updatedSessionsWithResponse);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date(),
      };

      const updatedSessionsWithError = sessions.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [
              ...session.messages,
              userMessage,
              errorMessage
            ],
          };
        }
        return session;
      });

      setSessions(updatedSessionsWithError);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quiz completion
  const handleQuizComplete = (quizId: string) => {
    // Empty handler - we no longer add a continuation message here
    // The input becomes available automatically when the quiz is completed
    console.log("Quiz completed:", quizId);
  };

  return (
    <Layout
      sidebar={
        <ChatHistory
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
        />
      }
      main={
        <div className="main-content">
          <ChatPanel
            messages={currentSession.messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            renderMCQ={(message: MCQMessage) => {
              if (message.mcqQuiz) {
                return (
                  <ErrorBoundary key={message.mcqQuiz.id}>
                    <MCQCard 
                      quiz={message.mcqQuiz} 
                      onComplete={() => handleQuizComplete(message.mcqQuiz!.id)}
                    />
                  </ErrorBoundary>
                );
              }
              return null;
            }}
          />
        </div>
      }
    />
  );
};

export default App;
