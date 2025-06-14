import React, { useState, useEffect } from 'react';
import { FaRobot, FaTimes, FaUser, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { customFetch } from '../services/api';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [currentFile, setCurrentFile] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFileUploading, setIsFileUploading] = useState(false);

    useEffect(() => {
        // Expose the chatbot methods globally
        window.chatbot = {
            handleFileUpload: handleFileUpload
        };

        // Cleanup on unmount
        return () => {
            window.chatbot = null;
        };
    }, [sessionId]); // Re-expose when sessionId changes

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const createNewSession = async () => {
        try {
            const response = await customFetch({
                endpoint: '/chatbot/sessions/',
                method: 'POST',
                requiresAuth: true
            });

            if (response.success) {
                setSessionId(response.data.session_id);
                setMessages([]); // Clear messages for new session
                return response.data.session_id;
            }
        } catch (error) {
            toast.error('Failed to create new chat');
            console.error('Error creating chat:', error);
            throw error;
        }
    };

    const handleFileUpload = async (file, source) => {
        try {
            setIsFileUploading(true);
            setIsOpen(true); // Open chat window immediately

            // Create new session first
            const newSessionId = await createNewSession();

            // Prepare file details based on source
            const fileDetails = {
                file_id: source.toLowerCase() === 'google' ? file.id : (file.id || `/${file.name}`),
                file_name: file.name,
                source: source.toLowerCase(),
                session_id: newSessionId
            };

            // Log the file and source for debugging
            console.log('Processing file:', fileDetails);

            const response = await customFetch({
                endpoint: '/chatbot/upload-document/',
                method: 'POST',
                body: fileDetails,
                requiresAuth: true
            });

            console.log('Upload response:', response);

            if (response.success) {
                setCurrentFile(file);
                setMessages([]); // Clear messages for new file
                toast.success(`File "${file.name}" processed successfully!`);
            } else {
                throw new Error(response.message || 'Failed to process file');
            }
        } catch (error) {
            console.error('Detailed error:', {
                message: error.message,
                error: error,
                file: file,
                source: source
            });
            toast.error(error.message || 'Failed to process file');
        } finally {
            setIsFileUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || !sessionId) return;

        try {
            setIsLoading(true);
            const userMessage = message.trim();
            setMessage('');

            // Add user message to chat
            setMessages(prev => [...prev, {
                type: 'user',
                content: userMessage,
                timestamp: new Date().toISOString()
            }]);

            // Send message to API
            const response = await customFetch({
                endpoint: '/chatbot/send-message/',
                method: 'POST',
                body: {
                    message: userMessage,
                    session_id: sessionId
                },
                requiresAuth: true
            });

            if (response.success) {
                // Add bot response to chat
                setMessages(prev => [...prev, {
                    type: 'bot',
                    content: response.data.response,
                    timestamp: new Date().toISOString()
                }]);
            } else {
                throw new Error(response.message || 'Failed to get response');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error.message || 'Failed to send message');
            // Add error message to chat
            setMessages(prev => [...prev, {
                type: 'error',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Chat Icon Button */}
            <button
                onClick={toggleChat}
                className="bg-[#006A71] hover:bg-[#005a61] text-white rounded-full p-4 shadow-lg transition-all duration-300"
            >
                <FaRobot className="w-6 h-6" />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl border border-[#9ACBD0]">
                    {/* Chat Header */}
                    <div className="bg-[#006A71] text-white p-4 rounded-t-lg flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">Chatbot Assistant</h3>
                        </div>
                        <button onClick={toggleChat} className="hover:text-[#9ACBD0]">
                            <FaTimes />
                        </button>
                    </div>

                    {/* Chat Body */}
                    <div className="p-4 h-96 flex flex-col">
                        {/* Current File Info */}
                        {currentFile && (
                            <div className="mb-4 bg-[#F2EFE7] p-2 rounded flex items-center gap-2">
                                <FaRobot className="text-[#006A71]" />
                                <span className="text-sm text-[#006A71]">Currently chatting about: {currentFile.name}</span>
                            </div>
                        )}

                        {/* File Upload Loading State */}
                        {isFileUploading && (
                            <div className="flex justify-center items-center h-full">
                                <div className="flex flex-col items-center gap-2">
                                    <FaSpinner className="animate-spin text-[#006A71] w-8 h-8" />
                                    <span className="text-[#006A71]">Uploading file...</span>
                                </div>
                            </div>
                        )}

                        {/* Chat Messages Area */}
                        {!isFileUploading && (
                            <div className="flex-grow overflow-y-auto mb-4 space-y-4">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg p-3 ${msg.type === 'user'
                                                ? 'bg-[#006A71] text-white'
                                                : msg.type === 'error'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                {msg.type === 'user' ? (
                                                    <FaUser className="text-sm" />
                                                ) : (
                                                    <FaRobot className="text-sm" />
                                                )}
                                                <span className="text-xs opacity-75">
                                                    {msg.type === 'user' ? 'You' : 'Assistant'}
                                                </span>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                                            <FaSpinner className="animate-spin text-[#006A71]" />
                                            <span className="text-sm text-gray-600">Generating...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Ask a question about your PDF..."
                                className="flex-grow p-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:border-[#48A6A7] text-[#006A71] placeholder-[#9ACBD0]"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!message.trim() || !sessionId || isLoading}
                                className={`p-2 rounded-lg transition-colors ${!message.trim() || !sessionId || isLoading
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-[#006A71] hover:bg-[#48A6A7] text-white'
                                    }`}
                            >
                                {isLoading ? (
                                    <FaSpinner className="animate-spin" />
                                ) : (
                                    'Send'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot; 