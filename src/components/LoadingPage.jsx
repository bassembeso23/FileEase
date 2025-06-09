import React from 'react';
import { motion } from 'framer-motion';
import { Cloud } from 'lucide-react';
import { createPortal } from 'react-dom';

const LoadingPage = () => {
    return createPortal(
        <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center">
            <div className="text-center bg-white/95 p-8 rounded-lg shadow-lg">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4"
                >
                    <Cloud size={64} className="text-[#006A71] mx-auto" />
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-2xl font-bold text-[#006A71] mb-2"
                >
                    FileEase
                </motion.h1>

                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.4, duration: 1 }}
                    className="h-1 bg-[#48A6A7] rounded-full"
                />

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-[#006A71] mt-4"
                >
                    Loading your cloud experience...
                </motion.p>
            </div>
        </div>,
        document.body
    );
};

export default LoadingPage; 