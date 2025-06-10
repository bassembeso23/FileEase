import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion as Motion } from "framer-motion";
import heroImg from "../assets/Server-cuate.png";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import { FiMenu, FiX } from 'react-icons/fi';
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

            <footer className="bg-primary text-light py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold">FileEase</h3>
                            <p className="text-sm leading-relaxed text-semiLight">
                                Your all-in-one cloud dashboard. Easily manage, share, and organize your files with seamless integration and top-notch security.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-semiLight hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                    </svg>
                                </a>
                                <a href="#" className="text-semiLight hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                                <a href="#" className="text-semiLight hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#features" className="text-semiLight hover:text-white transition-colors">Features</a></li>
                                <li><a href="/pricing" className="text-semiLight hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="/support" className="text-semiLight hover:text-white transition-colors">Help Center</a></li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold">Contact</h4>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center space-x-2 text-semiLight">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>FileEase@gmail.com</span>
                                </li>
                                <li className="flex items-center space-x-2 text-semiLight">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>+910010010101</span>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="/terms" className="text-semiLight hover:text-white transition-colors">Terms of Service</a></li>
                                <li><a href="/privacy" className="text-semiLight hover:text-white transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-semiLight/20 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <p className="text-sm">
                                &copy; {new Date().getFullYear()} FileEase. All rights reserved.
                            </p>
                            <div className="flex space-x-6">
                                <a href="/terms" className="text-sm text-semiLight hover:text-white transition-colors">Terms</a>
                                <a href="/privacy" className="text-sm text-semiLight hover:text-white transition-colors">Privacy</a>
                                <a href="/cookies" className="text-sm text-semiLight hover:text-white transition-colors">Cookies</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
