import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion as Motion } from "framer-motion";
import heroImg from "../assets/Server-cuate.png";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import { FiMenu, FiX } from 'react-icons/fi';
import Footer from '../components/Footer';
// import logo from "../assets/logo-removebg-preview.png";

export default function HomePage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen font-sans bg-light">
            <header className="flex justify-between items-center px-4 sm:px-6 py-4 shadow-md fixed top-0 left-0 w-full z-[1000] bg-primary md:bg-transparent md:backdrop-blur">
                <div className="flex items-center gap-2">
                    {/* <img src={logo} alt="FileEase logo" className="w-10 h-10 object-contain" /> */}
                    <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-white md:text-primary">FileEase</h1>
                </div>

                <div className="hidden md:flex items-center space-x-4">
                    <a
                        href="#features"
                        className="text-primary font-semibold hover:text-primary-dark transition-colors"
                    >
                        Features
                    </a>
                    <button
                        className="px-4 py-2 border rounded-lg font-medium hover:opacity-80 transition text-white bg-primary"
                        onClick={() => navigate("/auth")}
                    >
                        Login
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition text-white bg-secondary"
                        onClick={() => navigate("/auth")}
                    >
                        Register
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </header>

            {/* Mobile Menu Slider */}
            <div className={`
            fixed top-14 left-0 w-full bg-light shadow-lg z-40 
            transform transition-transform duration-300 ease-in-out
            ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}
            md:hidden
            `}>
                <div className="flex flex-col space-y-4 p-6 border-t border-black-100">
                    <a
                        href="#features"
                        className="text-primary py-2 hover:text-primary-dark transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Features
                    </a>
                    <button
                        className="px-4 py-2 border rounded-lg font-medium hover:opacity-80 transition text-left text-primary border-primary w-fit"
                        onClick={() => {
                            navigate("/auth");
                            setIsMenuOpen(false);
                        }}
                    >
                        Login
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition text-white text-left bg-primary w-fit"
                        onClick={() => {
                            navigate("/auth");
                            setIsMenuOpen(false);
                        }}
                    >
                        Register
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <section className="landing relative flex flex-col-reverse md:flex-row items-center justify-between px-6 pb-[90px] pt-28 md:pt-48 lg:pt-48 lg:pb-28 max-w-7xl mx-auto gap-8 lg:gap-10">

                <Motion.div
                    className="md:w-1/2 text-center md:text-left"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-6 text-primary">
                        All Your Clouds. One Dashboard.
                    </h2>
                    <p className="text-lg mb-6 text-secondary">
                        Access Google Drive and Dropbox from a single smart interface. Search everything instantly.
                    </p>
                    <button
                        className="px-6 py-3 mb-6 text-white rounded-xl text-lg font-semibold transition hover:scale-105"
                        style={{ backgroundColor: 'var(--primary-color)' }}
                        onClick={() => navigate("/auth")}
                    >
                        Get Started Now
                    </button>
                </Motion.div>

                <div>
                    <img src={heroImg} alt="cloud illustration" className="w-full max-w-64 mx-auto animate-up-and-down will-change-transform md:max-w-md" />
                    <a
                        href="#features"
                        className="go-down absolute bottom-8 left-1/2 -translate-x-1/2 text-primary hover:text-secondary mt-1transition-colors duration-300"
                    >
                        <MdKeyboardDoubleArrowDown className="text-5xl animate-bouncing" />
                    </a>
                </div>

            </section>

            <section className="px-6 py-[130px] bg-secondGround" id="features">
                <h2 className="text-3xl font-bold text-center mb-12 text-primary">
                    Powerful Features
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[
                        {
                            title: "Unified Cloud Access",
                            desc: "Connect and manage Google Drive, Dropbox, and Terabox from one interface.",
                            icon: "🧩",
                        },
                        {
                            title: "Upload Files & Folders",
                            desc: "Easily upload, create folders, and organize your files across platforms.",
                            icon: "📁",
                        },
                        {
                            title: "Super Search Engine",
                            desc: "Blazing fast search, even inside file contents and documents.",
                            icon: "🔍",
                        },
                        {
                            title: "Secure & Encrypted",
                            desc: "Your data is encrypted end-to-end with modern security standards.",
                            icon: "🔐",
                        },
                        {
                            title: "Cross-Platform Sync",
                            desc: "Access your data anytime from mobile, tablet, or desktop devices.",
                            icon: "🔄",
                        },
                        {
                            title: "Smart Dashboard",
                            desc: "Visualize your storage usage, recent files, and cloud health at a glance.",
                            icon: "📊",
                        },
                    ].map((feature, idx) => (
                        <Motion.div
                            key={idx}
                            className="p-6 bg-[var(--light-color)] rounded-xl shadow-md hover:shadow-xl transition duration-300 border-t-4"
                            style={{ borderTopColor: 'var(--primary-color)' }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--primary-color)' }}>
                                {feature.title}
                            </h3>
                            <p className="text-gray-700">{feature.desc}</p>
                        </Motion.div>
                    ))}
                </div>
            </section>

            <section className="px-6 py-24 bg-light" id="why-us">
                <h2 className="text-3xl font-bold text-center mb-12 text-primary">Why Choose Us?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[
                        {
                            icon: "⚡",
                            title: "Lightning Fast",
                            desc: "Experience unmatched performance with ultra-fast load times and seamless transitions.",
                        },
                        {
                            icon: "💼",
                            title: "Professional Design",
                            desc: "Modern, responsive, and intuitive UI designed to enhance your productivity.",
                        },
                        {
                            icon: "🤝",
                            title: "Reliable Support",
                            desc: "We're here to help you 24/7 with any issue or question you may have.",
                        },
                        {
                            icon: "🔒",
                            title: "Top Security",
                            desc: "Your data is protected with the latest encryption standards and secure protocols.",
                        },
                        {
                            icon: "☁️",
                            title: "Cloud Integration",
                            desc: "Easily connect with your favorite cloud services like Google Drive and OneDrive.",
                        },
                        {
                            icon: "📈",
                            title: "Analytics & Insights",
                            desc: "Track your storage usage and access detailed reports to optimize your workflow.",
                        },
                    ].map((item, idx) => (
                        <Motion.div
                            key={idx}
                            className="bg-secondGround rounded-xl shadow-custom p-6 border-t-4 border-t-primary"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.15 }}
                            viewport={{ once: true }}
                        >
                            <div className="text-5xl mb-4">{item.icon}</div>
                            <h3 className="text-xl font-semibold text-primary mb-2">{item.title}</h3>
                            <p className="text-gray-700">{item.desc}</p>
                        </Motion.div>
                    ))}
                </div>
            </section>

            <section className="py-24 px-6 bg-secondGround">
                <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
                    <div className="md:w-1/2 text-center md:text-left">
                        <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-6">Why FileEase?</h2>
                        <p className="text-lg text-gray-800 mb-6 leading-relaxed">
                            Whether you're managing personal files or collaborating across teams, FileEase is your secure, efficient, and unified solution to all cloud storage needs. Built for speed, simplicity, and security.
                        </p>
                        <button
                            className="px-6 py-3 text-white rounded-lg font-semibold transition hover:scale-105 bg-primary"
                            onClick={() => navigate("/auth")}
                        >
                            Join Us Today
                        </button>
                    </div>
                    <div className="md:w-1/2">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/4149/4149658.png"
                            alt="cloud integration"
                            className="w-full max-w-md mx-auto"
                        />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
