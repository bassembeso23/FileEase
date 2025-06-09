import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DashboardStats from '../components/DashboardStats';
import FileManager from '../components/FileManager';
import CloudAccounts from '../components/CloudAccounts';
import RecentActivity from '../components/RecentActivity';

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
                    <h1 className="text-2xl font-bold text-[#006A71] mb-6">Dashboard</h1>

                    <DashboardStats />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className="lg:col-span-2">
                            <FileManager />
                        </div>
                        <div className="lg:col-span-1">
                            <RecentActivity />
                        </div>
                    </div>

                    <CloudAccounts />
                </div>
            </main>
        </div>
    );
};
