import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DashboardStats from '../components/DashboardStats';
import FileManager from '../components/FileManager';
import CloudAccounts from '../components/CloudAccounts';
import Chatbot from '../components/Chatbot';

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header toggleSidebar={toggleSidebar} />
            <Sidebar isOpen={sidebarOpen} />

            <main className={`transition-all duration-300 pt-16 ${sidebarOpen ? 'md:ml-64' : 'ml-0 md:ml-16'}`}>
                <div className="p-4 md:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-[#006A71]">Dashboard</h1>
                    </div>

                    <DashboardStats />

                    <div className="mb-6">
                        <FileManager />
                    </div>

                    <CloudAccounts />
                </div>
            </main>

            <Chatbot />
        </div>
    );
}
