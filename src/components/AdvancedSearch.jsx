import React, { useState } from "react";
import { FileText, Eye, MoreVertical, Search, Loader2 } from "lucide-react";
import { customFetch } from '../services/api';
import { toast } from 'react-toastify';
import { useCloud } from '../contexts/CloudContext';

export default function AdvancedSearch() {
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { files } = useCloud();

    const handleSearch = async () => {
        if (query.trim() === "") {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await customFetch({
                endpoint: `/search/?q=${encodeURIComponent(query)}`,
                method: 'GET',
                requiresAuth: true
            });

            if (response && Array.isArray(response)) {
                // Match search results with existing files
                const matchedResults = response.map(result => {
                    const matchedFile = files.find(file => file.id === result.file_id);
                    return {
                        ...result,
                        matchedFile
                    };
                });
                setSearchResults(matchedResults);
                toast.success('Search completed successfully');
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Search failed:', error);
            toast.error(error.message || 'Failed to perform search');
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="semantic-search" className="p-6 md:ml-16 lg:ml-64 pt-20">
            <div className="bg-white rounded-2xl p-6 shadow-md max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-[#006A71]">
                    Advanced File Search
                </h2>

                {/* Search bar with icon */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 flex items-center justify-center bg-[#F2EFE7] rounded-full">
                        <Search size={36} className="text-[#006A71]" />
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search files using natural language..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isLoading) {
                                    handleSearch();
                                }
                            }}
                            className="w-full px-4 py-3 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48A6A7] focus:border-transparent text-[#006A71] placeholder-[#9ACBD0]"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isLoading || !query.trim()}
                        className={`px-6 py-3 text-white rounded-lg transition-colors ${isLoading || !query.trim()
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-[#006A71] hover:bg-[#48A6A7]'
                            }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={20} />
                                <span>Searching...</span>
                            </div>
                        ) : (
                            'Search'
                        )}
                    </button>
                </div>

                {/* Results Section */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <Loader2 className="animate-spin mx-auto mb-4 text-[#006A71]" size={40} />
                        <p className="text-gray-500">Searching through your files...</p>
                    </div>
                ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map((result, index) => (
                            <div
                                key={index}
                                className="rounded-xl bg-white border border-[#9ACBD0] p-4 transition-all hover:shadow-lg hover:border-[#48A6A7]"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-[#F2EFE7] rounded-lg flex items-center justify-center">
                                        <FileText className="text-[#006A71]" size={24} />
                                    </div>
                                    <MoreVertical className="cursor-pointer text-gray-500 hover:text-[#006A71]" />
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-medium text-[#006A71] truncate">
                                        {result.matchedFile ? result.matchedFile.name : result.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {result.matchedFile ? (
                                            <>
                                                {result.matchedFile.size ? `${(result.matchedFile.size / 1024).toFixed(1)} KB` : 'N/A'} •
                                                {new Date(result.matchedFile.modifiedTime).toLocaleDateString()}
                                            </>
                                        ) : (
                                            `Author: ${result.author} • Year: ${result.year}`
                                        )}
                                    </p>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 line-clamp-3">{result.snippet}</p>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <a
                                            href={result.matchedFile ? result.matchedFile.webViewLink : result.view_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#006A71] hover:text-[#48A6A7] transition-colors"
                                            title="View"
                                        >
                                            <Eye size={20} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No files found matching your search.</p>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Enter a search query to find files.</p>
                    </div>
                )}
            </div>
        </div>
    );
} 