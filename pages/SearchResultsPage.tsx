import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import type { Course } from '../types';
import CourseCard from '../components/CourseCard';
import { FilterIcon, ChevronDownIcon, XIcon, SearchIcon, MessageSquareIcon, SendIcon, UserIcon, AppLogoIcon, PaperclipIcon, SettingsIcon, LayersIcon, FilePlusIcon, Trash2Icon, ShieldCheckIcon, MicIcon, ThumbsUpIcon, ThumbsDownIcon, CopyIcon, Volume2Icon, EditIcon } from '../components/Icons';

// Extended Mock Catalog for AI recommendations
const mockLMSCatalog: Course[] = [
    {
        id: 'res1',
        title: 'LinkedIn Co-Founder Reid Hoffman on How to Supercharge Your Career with AI',
        provider: 'LinkedIn Learning',
        imageUrl: 'https://picsum.photos/seed/reid/400/225',
        tags: ['Online', 'AI', 'Career']
    },
    {
        id: 'res2',
        title: 'Orlando Magic Co-Founder Pat Williams (Thirty Minute Mentors)',
        provider: 'LinkedIn Learning',
        imageUrl: 'https://picsum.photos/seed/pat/400/225',
        tags: ['Online', 'Mentoring']
    },
    {
        id: 'res4',
        title: 'Co-Management, Updates, Reporting & Troubleshooting',
        provider: 'Coursera',
        imageUrl: 'https://picsum.photos/seed/comanage/400/225',
        tags: ['Online', 'Management']
    },
    {
        id: 'res5',
        title: 'Digital Strategies: Managing Sociotechnological Co-Evolution',
        provider: 'Coursera',
        imageUrl: 'https://picsum.photos/seed/digital/400/225',
        tags: ['Online', 'Strategy']
    },
    {
        id: 'ai-1',
        title: 'Generative AI for Business Leaders',
        provider: 'Udemy',
        imageUrl: 'https://picsum.photos/seed/genai-biz/400/225',
        tags: ['AI', 'Leadership']
    },
    {
        id: 'ai-2',
        title: 'Python for Data Science and AI',
        provider: 'Coursera',
        imageUrl: 'https://picsum.photos/seed/python-ai/400/225',
        tags: ['AI', 'Data Science', 'Python']
    },
    {
        id: 'lead-1',
        title: 'Strategic Leadership in a Volatile World',
        provider: 'Harvard',
        imageUrl: 'https://picsum.photos/seed/strat-lead/400/225',
        tags: ['Leadership', 'Strategy']
    },
    {
        id: 'lead-2',
        title: 'Emotional Intelligence at Work',
        provider: 'Internal',
        imageUrl: 'https://picsum.photos/seed/eq-work/400/225',
        tags: ['Leadership', 'Soft Skills']
    },
    {
        id: 'tech-1',
        title: 'Advanced React Patterns',
        provider: 'Frontend Masters',
        imageUrl: 'https://picsum.photos/seed/react-adv/400/225',
        tags: ['Technology', 'React']
    },
    {
        id: 'tech-2',
        title: 'System Design for Large Scale Systems',
        provider: 'Internal',
        imageUrl: 'https://picsum.photos/seed/sys-design/400/225',
        tags: ['Technology', 'System Design']
    },
    {
        id: 'data-1',
        title: 'Data Visualization with Tableau',
        provider: 'Coursera',
        imageUrl: 'https://picsum.photos/seed/tableau/400/225',
        tags: ['Data', 'Visualization']
    },
    {
        id: 'data-2',
        title: 'SQL for Data Analysis',
        provider: 'Udacity',
        imageUrl: 'https://picsum.photos/seed/sql-data/400/225',
        tags: ['Data', 'SQL']
    }
];

const FilterDropdown: React.FC<{ label: string }> = ({ label }) => (
    <button className="flex items-center justify-between px-4 py-1.5 text-sm font-medium text-r-gray-700 bg-white border border-r-gray-300 rounded-full hover:bg-r-gray-50 focus:outline-none min-w-[100px]">
        <span>{label}</span>
        <ChevronDownIcon className="w-4 h-4 ml-2 text-r-gray-500" />
    </button>
);

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    sources?: { title: string; url: string }[];
    files?: { name: string; type: string }[];
    isGuardrailVerified?: boolean;
}

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            } else {
                reject(new Error("Failed to convert file to base64"));
            }
        };
        reader.onerror = error => reject(error);
    });
};


const AISnippetBanner: React.FC<{ query: string; onSwitchToAI: () => void }> = ({ query, onSwitchToAI }) => {
    const [snippet, setSnippet] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSnippet = async () => {
            if (!query) return;
            setLoading(true);
            try {
                if (!process.env.API_KEY) {
                     setSnippet("Experience AI-powered search results.");
                     setLoading(false);
                     return;
                }
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: `Provide a concise, factual, and valuable snippet (max 20 words) answering: "${query}". Do not use intro phrases.`,
                });
                setSnippet(response.text || "See what AI thinks about this...");
            } catch (e) {
                setSnippet("Get instant AI summaries for this topic.");
            } finally {
                setLoading(false);
            }
        };
        fetchSnippet();
    }, [query]);

    if (!query) return null;

    return (
        <div className="bg-[#051a5c] border-b border-white/10 py-3 relative z-10 text-white shadow-inner">
             <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-6 h-6 rounded bg-white/20 flex items-center justify-center shadow-sm backdrop-blur-sm">
                        <span className="text-[9px] font-bold text-white">AI</span>
                    </div>
                    {loading ? (
                        <div className="h-4 w-48 bg-white/10 rounded animate-pulse"></div>
                    ) : (
                        <p className="text-sm text-indigo-100 truncate">
                            <span className="font-semibold text-white mr-1">AI Output:</span> {snippet}
                        </p>
                    )}
                </div>
                <button 
                    onClick={onSwitchToAI}
                    className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-full transition-colors flex-shrink-0"
                >
                    Open AI Mode &rarr;
                </button>
             </div>
        </div>
    );
};

const getRelatedCourses = (currentPrompt: string, historyMessages: ChatMessage[]): Course[] => {
    const scoreCourse = (course: Course, text: string) => {
        const keywords = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        let score = 0;
        const searchTarget = (course.title + ' ' + course.tags.join(' ')).toLowerCase();
        keywords.forEach(kw => {
            if (searchTarget.includes(kw)) score++;
        });
        return score;
    };
    const currentMatches = mockLMSCatalog
        .map(c => ({ course: c, score: scoreCourse(c, currentPrompt) }))
        .sort((a, b) => b.score - a.score)
        .filter(x => x.score > 0)
        .map(x => x.course);
    const historyText = historyMessages.filter(m => m.role === 'user').map(m => m.text).join(' ');
    const historyMatches = mockLMSCatalog
        .map(c => ({ course: c, score: scoreCourse(c, historyText) }))
        .sort((a, b) => b.score - a.score)
        .filter(x => x.score > 0)
        .map(x => x.course);
    const topCurrent = currentMatches.slice(0, 4);
    const topHistory = historyMatches.filter(c => !topCurrent.find(tc => tc.id === c.id)).slice(0, 1);
    let combined = [...topCurrent, ...topHistory];
    if (combined.length < 5) {
        const remaining = mockLMSCatalog.filter(c => !combined.find(ec => ec.id === c.id));
        combined = [...combined, ...remaining.slice(0, 5 - combined.length)];
    }
    return combined;
};

// Global state for Admin AI Control (in-memory for prototype)
let globalAdminPrompt = "You are a helpful learning assistant for the Reliance New LMS platform.";
let globalAdminDomains: { id: string; title: string; description: string; files: File[] }[] = [
    { id: '1', title: 'General', description: 'General knowledge and guidelines', files: [] }
];

const AdminAIControlView: React.FC = () => {
    const [prompt, setPrompt] = useState(globalAdminPrompt);
    const [domains, setDomains] = useState(globalAdminDomains);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeDomainId, setActiveDomainId] = useState<string | null>(null);

    const handleSave = () => {
        globalAdminPrompt = prompt;
        globalAdminDomains = domains;
        alert('Admin settings saved successfully!');
    };

    const handleAddDomain = () => {
        setDomains([...domains, { id: Date.now().toString(), title: 'New Domain', description: 'Domain description', files: [] }]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && activeDomainId) {
            const newFiles = Array.from(e.target.files);
            setDomains(domains.map(d => d.id === activeDomainId ? { ...d, files: [...d.files, ...newFiles] } : d));
        }
    };

    return (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Admin AI Control</h2>
                <button onClick={handleSave} className="px-4 py-2 bg-r-blue text-white rounded-md font-medium">Save All Changes</button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Customize System Prompt</h3>
                <p className="text-sm text-gray-500 mb-4">Define the persona and core instructions for the AI assistant.</p>
                <textarea 
                    className="w-full h-32 p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-r-blue outline-none"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Knowledge Domains (RAG)</h3>
                        <p className="text-sm text-gray-500">Create domains and upload PDF documents. The AI will automatically route queries to the relevant domain.</p>
                    </div>
                    <button onClick={handleAddDomain} className="px-4 py-2 border border-r-blue text-r-blue rounded-md font-medium hover:bg-blue-50 transition-colors">
                        + Add Domain
                    </button>
                </div>
                
                <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept=".pdf,.txt,.doc,.docx" />

                <div className="space-y-4">
                    {domains.map((domain) => (
                        <div key={domain.id} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                            <input 
                                className="font-bold text-lg w-full mb-2 outline-none bg-transparent border-b border-transparent focus:border-gray-300" 
                                value={domain.title} 
                                onChange={(e) => setDomains(domains.map(d => d.id === domain.id ? { ...d, title: e.target.value } : d))} 
                                placeholder="Domain Title"
                            />
                            <textarea 
                                className="w-full text-sm text-gray-600 outline-none mb-3 bg-transparent border-b border-transparent focus:border-gray-300 resize-none" 
                                value={domain.description} 
                                onChange={(e) => setDomains(domains.map(d => d.id === domain.id ? { ...d, description: e.target.value } : d))} 
                                placeholder="Describe what kind of queries this domain handles..."
                                rows={2}
                            />
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                                {domain.files.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md text-xs border border-gray-200 text-gray-700 shadow-sm">
                                        <PaperclipIcon className="w-3 h-3 text-gray-400" />
                                        <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                                        <button 
                                            onClick={() => setDomains(domains.map(d => d.id === domain.id ? { ...d, files: d.files.filter((_, i) => i !== idx) } : d))} 
                                            className="text-gray-400 hover:text-red-500 ml-1"
                                        >
                                            <XIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => { setActiveDomainId(domain.id); fileInputRef.current?.click(); }} 
                                className="text-sm text-r-blue flex items-center gap-1 font-medium hover:text-r-blue-dark"
                            >
                                <FilePlusIcon className="w-4 h-4" /> Add Documents
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AIModeView: React.FC<{ initialQuery: string }> = ({ initialQuery }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);
    const [isListening, setIsListening] = useState(false);
    
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const basicQuestions = [
        "How do I improve my leadership skills?",
        "What courses are best for learning Python?",
        "Can you help me create a learning plan?",
        "What are the mandatory compliance courses?"
    ];

    const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, followUpQuestions]);

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }
        
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.onstart = () => {
            setIsListening(true);
        };
        
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
        };
        
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognition.start();
    };

    const handleReadAloud = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Text-to-speech is not supported in this browser.");
        }
    };

    const handleSendMessage = async (text: string) => {
        if (!text.trim() && attachedFiles.length === 0) return;

        const newUserMsg: ChatMessage = { 
            id: Date.now().toString(), 
            role: 'user', 
            text: text,
            files: attachedFiles.map(f => ({ name: f.name, type: f.type })) 
        };
        
        const updatedMessages = [...messages, newUserMsg];
        setMessages(updatedMessages);
        setFollowUpQuestions([]);
        
        const currentFiles = [...attachedFiles];
        setInputValue('');
        setAttachedFiles([]);
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // 1. Analyze query to find relevant domain
            let selectedDomain = globalAdminDomains[0]; // Default to first domain
            let domainContext = "";
            
            if (globalAdminDomains.length > 1) {
                const domainDescriptions = globalAdminDomains.map(d => `ID: ${d.id}, Title: ${d.title}, Description: ${d.description}`).join('\n');
                const routingPrompt = `Analyze the following user query and select the most relevant knowledge domain ID from the list below. If none are highly relevant, return the ID of the 'General' domain. Only return the ID, nothing else.\n\nDomains:\n${domainDescriptions}\n\nUser Query: "${text}"`;
                
                try {
                    const routingResponse = await ai.models.generateContent({
                        model: 'gemini-3-flash-preview',
                        contents: routingPrompt,
                    });
                    const selectedId = routingResponse.text?.trim();
                    const foundDomain = globalAdminDomains.find(d => d.id === selectedId);
                    if (foundDomain) {
                        selectedDomain = foundDomain;
                    }
                } catch (e) {
                    console.error("Routing error", e);
                }
            }

            // 2. Prepare context from selected domain
            if (selectedDomain && selectedDomain.files.length > 0) {
                domainContext = `\n\n[System Note: Use the following context from the '${selectedDomain.title}' domain to answer the user's query. If the context is not relevant, ignore it.]\n`;
                // In a real app, we would extract text from PDFs here. 
                // For this prototype, we'll just mention the files are being used.
                domainContext += `Attached Knowledge Base Files: ${selectedDomain.files.map(f => f.name).join(', ')}`;
            }

            const finalSystemInstruction = globalAdminPrompt;

            const contents = updatedMessages.map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));

            let promptText = text;
            if (domainContext) {
                promptText = `${text}${domainContext}`;
            }

            const lastTurnParts: any[] = [{ text: promptText }];
            for (const file of currentFiles) {
                const base64Data = await fileToBase64(file);
                lastTurnParts.push({ inlineData: { mimeType: file.type, data: base64Data } });
            }
            
            // Add domain files to context
            if (selectedDomain) {
                for (const file of selectedDomain.files) {
                    try {
                        const base64Data = await fileToBase64(file);
                        lastTurnParts.push({ inlineData: { mimeType: file.type, data: base64Data } });
                    } catch (e) {
                        console.error("Error attaching domain file", e);
                    }
                }
            }

            contents[contents.length - 1].parts = lastTurnParts;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: contents,
                config: {
                    tools: [{ googleSearch: {} }],
                    systemInstruction: finalSystemInstruction
                },
            });

            let finalResponseText = response.text || "I couldn't find an answer to that.";

            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            const sources: { title: string; url: string }[] = [];
            if (groundingChunks) {
                groundingChunks.forEach((chunk: any) => {
                    if (chunk.web) {
                        sources.push({ title: chunk.web.title || chunk.web.uri, url: chunk.web.uri });
                    }
                });
            }

            const newAiMsg: ChatMessage = { 
                id: (Date.now() + 1).toString(), 
                role: 'model', 
                text: finalResponseText,
                sources: sources.length > 0 ? sources : undefined,
            };
            setMessages(prev => [...prev, newAiMsg]);

            // Generate follow-up questions
            try {
                const followUpPrompt = `Based on the following conversation, suggest 3 short, relevant follow-up questions the user could ask next. Return ONLY a JSON array of strings.\n\nUser: ${text}\nAI: ${finalResponseText}`;
                const followUpResponse = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: followUpPrompt,
                    config: { responseMimeType: "application/json" }
                });
                if (followUpResponse.text) {
                    const questions = JSON.parse(followUpResponse.text);
                    if (Array.isArray(questions)) {
                        setFollowUpQuestions(questions.slice(0, 3));
                    }
                }
            } catch (e) {
                console.error("Error generating follow-ups", e);
            }

        } catch (error) {
            console.error("AI Error:", error);
            const errorMsg: ChatMessage = { 
                id: (Date.now() + 1).toString(), 
                role: 'model', 
                text: "Sorry, I encountered an error while processing your request. Please try again." 
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (initialQuery && !hasInitialized.current) {
            hasInitialized.current = true;
            handleSendMessage(initialQuery);
        }
    }, [initialQuery]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachedFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
        }
    };

    return (
        <div className="flex h-full bg-white rounded-xl shadow-sm border border-r-gray-200 overflow-hidden relative max-w-4xl mx-auto">
            <div className="flex-grow flex flex-col h-full relative min-w-0">
                <div className="h-12 flex-shrink-0 border-b bg-white flex items-center justify-center px-4 z-10">
                    <span className="text-sm font-bold text-gray-700">AI Learning Assistant</span>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-r-gray-50 scroll-smooth">
                    {messages.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-r-gray-400 opacity-50 text-center px-8">
                            <AppLogoIcon className="w-16 h-16 mb-4 text-indigo-200" />
                            <p className="text-lg font-medium text-gray-600 mb-6">Ask me anything about your learning journey!</p>
                            
                            <div className="flex flex-col gap-2 w-full max-w-md">
                                {basicQuestions.map((q, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handleSendMessage(q)}
                                        className="text-sm text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-r-blue hover:text-r-blue transition-colors shadow-sm"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm relative group ${
                                msg.role === 'user' 
                                    ? 'bg-r-blue text-white rounded-tr-none' 
                                    : 'bg-white text-r-gray-800 border border-r-gray-200 rounded-tl-none'
                            }`}>
                                <div className="flex items-start gap-3">
                                    {msg.role === 'model' && (
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <AppLogoIcon className="w-5 h-5" />
                                        </div>
                                    )}
                                    <div className="w-full">
                                        {msg.files && msg.files.length > 0 && (
                                            <div className="mb-2 flex flex-wrap gap-2">
                                                {msg.files.map((f, i) => (
                                                    <div key={i} className="bg-white/20 px-2 py-1 rounded text-xs border border-white/30 flex items-center gap-1">
                                                        <PaperclipIcon className="w-3 h-3" /> {f.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                        
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-4 pt-3 border-t border-gray-100">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sources:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {msg.sources.map((src, i) => (
                                                        <a 
                                                            key={i} 
                                                            href={src.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-r-blue hover:underline bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-center gap-1"
                                                        >
                                                            {src.title} ↗
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className={`absolute -bottom-4 ${msg.role === 'user' ? 'right-2' : 'left-2'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white shadow-md border border-gray-200 rounded-full px-2 py-1 z-10`}>
                                    {msg.role === 'user' ? (
                                        <>
                                            <button onClick={() => navigator.clipboard.writeText(msg.text)} className="p-1 text-gray-500 hover:text-r-blue" title="Copy"><CopyIcon className="w-3 h-3" /></button>
                                            <button onClick={() => setInputValue(msg.text)} className="p-1 text-gray-500 hover:text-r-blue" title="Edit"><EditIcon className="w-3 h-3" /></button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="p-1 text-gray-500 hover:text-green-600" title="Like"><ThumbsUpIcon className="w-3 h-3" /></button>
                                            <button className="p-1 text-gray-500 hover:text-red-600" title="Dislike"><ThumbsDownIcon className="w-3 h-3" /></button>
                                            <button onClick={() => navigator.clipboard.writeText(msg.text)} className="p-1 text-gray-500 hover:text-r-blue" title="Copy"><CopyIcon className="w-3 h-3" /></button>
                                            <button onClick={() => handleReadAloud(msg.text)} className="p-1 text-gray-500 hover:text-r-blue" title="Read Aloud"><Volume2Icon className="w-3 h-3" /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-r-gray-200 shadow-sm flex items-center gap-2">
                                 <div className="w-2 h-2 bg-r-blue rounded-full animate-bounce"></div>
                                 <div className="w-2 h-2 bg-r-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                 <div className="w-2 h-2 bg-r-blue rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                 <span className="text-xs text-gray-400 ml-2 font-medium">Generating...</span>
                            </div>
                        </div>
                    )}

                    {followUpQuestions.length > 0 && !isLoading && (
                        <div className="flex flex-col gap-2 mt-4 ml-12">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Suggested Follow-ups</p>
                            <div className="flex flex-wrap gap-2">
                                {followUpQuestions.map((q, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handleSendMessage(q)}
                                        className="text-xs px-3 py-1.5 bg-white border border-r-blue text-r-blue rounded-full hover:bg-blue-50 transition-colors shadow-sm"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="flex-shrink-0 p-4 bg-white border-t border-r-gray-200 z-10">
                    {attachedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2 px-2">
                            {attachedFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-xs border border-gray-200 text-gray-700">
                                    <span className="truncate max-w-[120px]">{file.name}</span>
                                    <button onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))} className="text-gray-500 hover:text-red-500">
                                        <XIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
                        className="relative flex items-center gap-2"
                    >
                        <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                            title="Upload files"
                        >
                            <PaperclipIcon className="w-5 h-5" />
                        </button>
                        <button 
                            type="button"
                            onClick={handleVoiceInput}
                            className={`p-2.5 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-500 hover:bg-gray-100'}`}
                            title="Voice input"
                        >
                            <MicIcon className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Ask a follow-up question..."}
                            className="flex-grow pl-4 pr-12 py-3 rounded-full border border-r-gray-300 focus:outline-none focus:ring-2 focus:ring-r-blue focus:border-transparent bg-r-gray-50 text-gray-900"
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            disabled={(!inputValue.trim() && attachedFiles.length === 0) || isLoading}
                            className="absolute right-2 p-2 bg-r-blue text-white rounded-full hover:bg-r-blue-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const SearchResultsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const modeParam = searchParams.get('mode');
    const [searchMode, setSearchMode] = useState<'exact' | 'similar'>('exact');
    const [activeTab, setActiveTab] = useState<'results' | 'ai' | 'admin'>(modeParam === 'ai' ? 'ai' : 'results');

    useEffect(() => {
        if (modeParam === 'ai') {
            setActiveTab('ai');
        }
    }, [modeParam]);

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <div className="bg-subnav-blue border-b border-white/10 sticky top-16 z-20 shadow-md">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('results')}
                            className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'results'
                                    ? 'border-white text-white'
                                    : 'border-transparent text-r-gray-300 hover:text-white hover:border-gray-400'
                            }`}
                        >
                            Search Results
                        </button>
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                                activeTab === 'ai'
                                    ? 'border-white text-white'
                                    : 'border-transparent text-r-gray-300 hover:text-white hover:border-gray-400'
                            }`}
                        >
                            <span className="flex items-center justify-center w-5 h-5 bg-gradient-to-tr from-purple-400 to-indigo-400 text-white text-[10px] font-bold rounded-sm shadow-sm">AI</span>
                            AI Mode
                        </button>
                        <button
                            onClick={() => setActiveTab('admin')}
                            className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                                activeTab === 'admin'
                                    ? 'border-white text-white'
                                    : 'border-transparent text-r-gray-300 hover:text-white hover:border-gray-400'
                            }`}
                        >
                            <SettingsIcon className="w-4 h-4" />
                            Admin AI Control
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'results' && query && (
                <AISnippetBanner query={query} onSwitchToAI={() => setActiveTab('ai')} />
            )}

            {activeTab === 'results' && (
                <div className="bg-white border-b border-gray-200 sticky top-[7.5rem] z-10 shadow-sm">
                    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <button className="flex items-center gap-2 text-r-blue font-semibold px-4 py-2 border border-r-blue rounded-full bg-blue-50 hover:bg-blue-100 transition-colors">
                                <FilterIcon className="w-4 h-4" />
                                Filter by Academies
                            </button>
                            <div className="flex items-center gap-4 self-end md:self-auto">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-700">Sort by :</span>
                                    <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-r-blue">
                                        Name: A-Z (↑) <ChevronDownIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                    <button className="p-2 hover:bg-gray-100 border-r border-gray-300">
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                                    </button>
                                    <button className="p-2 bg-r-blue text-white">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V2z"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <FilterDropdown label="Category" />
                            <FilterDropdown label="Language" />
                            <FilterDropdown label="Source" />
                            <FilterDropdown label="Topics" />
                            <FilterDropdown label="Skill" />
                            <FilterDropdown label="Duration" />
                            <FilterDropdown label="Proficiency Level" />
                            <button className="ml-auto text-sm font-bold text-r-blue hover:text-r-blue-dark">Reset</button>
                        </div>
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${searchMode === 'exact' ? 'border-r-blue' : 'border-gray-400'}`}>
                                        {searchMode === 'exact' && <div className="w-2.5 h-2.5 rounded-full bg-r-blue"></div>}
                                    </div>
                                    <input type="radio" name="searchMode" className="hidden" checked={searchMode === 'exact'} onChange={() => setSearchMode('exact')} />
                                    <span className={`text-sm font-medium ${searchMode === 'exact' ? 'text-gray-900' : 'text-gray-600'}`}>Exact Search</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${searchMode === 'similar' ? 'border-r-blue' : 'border-gray-400'}`}>
                                        {searchMode === 'similar' && <div className="w-2.5 h-2.5 rounded-full bg-r-blue"></div>}
                                    </div>
                                    <input type="radio" name="searchMode" className="hidden" checked={searchMode === 'similar'} onChange={() => setSearchMode('similar')} />
                                    <span className={`text-sm font-medium ${searchMode === 'similar' ? 'text-gray-900' : 'text-gray-600'}`}>Similar Search</span>
                                </label>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <span className="inline-flex items-center px-3 py-1 rounded bg-teal-50 text-teal-800 text-sm border border-teal-100">
                                    <span className="font-semibold mr-1">Search:</span> {query || 'co'}
                                    <button className="ml-2 hover:text-teal-900"><XIcon className="w-4 h-4" /></button>
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded bg-teal-50 text-teal-800 text-sm border border-teal-100">
                                    <span className="font-semibold mr-1">Type-search:</span> {searchMode}-search
                                    <button className="ml-2 hover:text-teal-900"><XIcon className="w-4 h-4" /></button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-grow bg-r-gray-50 flex flex-col">
                {activeTab === 'results' ? (
                    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                        <p className="text-sm font-bold text-gray-800 mb-6">Total search result: {mockLMSCatalog.slice(0, 8).length}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {mockLMSCatalog.slice(0, 8).map(course => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    </div>
                ) : activeTab === 'ai' ? (
                    <div className="flex-grow h-[calc(100vh-8rem)] w-full overflow-hidden p-4"> 
                        <AIModeView initialQuery={query || 'Learning opportunities at Reliance'} />
                    </div>
                ) : (
                    <div className="flex-grow w-full overflow-y-auto">
                        <AdminAIControlView />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;