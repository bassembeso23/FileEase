import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AdvancedSearch from '../components/AdvancedSearch';

const SemanticSearchPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const isMobileView = window.innerWidth < 768;
            setIsMobile(isMobileView);
            if (isMobileView) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-20
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <Sidebar isOpen={isSidebarOpen} />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                <div className="z-30 relative">
                    <Header onMenuClick={toggleSidebar} />
                </div>
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <AdvancedSearch />
                </main>
            </div>

            {/* Mobile backdrop */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}
        </div>
    );
};

export default SemanticSearchPage; 