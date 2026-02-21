import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const dropdownRef = useRef(null);

    const [formData, setFormData] = useState({
        jobDescription: '',
        resume: { name: 'Default_Resume.pdf', isDefault: true },
        cv: '',
        difficulty: 'intermediate',
        interviewer: 'Sarah',
        questionCount: 10
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        if (isProfileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileOpen]);

    const handleLogout = () => {
        navigate('/');
    };

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    const nextStep = () => {
        if (modalStep === 2) {
            setModalStep(3);
            setTimeout(() => {
                setModalStep(4);
            }, 2500); // Simulated loading
        } else {
            setModalStep(modalStep + 1);
        }
    };

    const prevStep = () => {
        if (modalStep > 1) {
            setModalStep(modalStep - 1);
        }
    };

    const resetModal = () => {
        setIsModalOpen(false);
        setModalStep(1);
    };

    const interviewers = [
        { name: 'Sarah', role: 'Technical Recruiter', icon: 'woman' },
        { name: 'Michael', role: 'Engineering Lead', icon: 'man' },
        { name: 'Emily', role: 'HR Director', icon: 'face' }
    ];

    return (
        <div className="bg-background-light text-slate-900 min-h-screen">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" className="w-[200px] h-[60px] object-contain" alt="preply logo" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={toggleProfile}
                            className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-slate-300 transition-all"
                        >
                            <span className="material-icons-outlined text-slate-500">person</span>
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-5 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                        <span className="material-icons-outlined text-slate-400 text-3xl">person</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 truncate">
                                        jatele2781@daikoa.com
                                    </span>
                                </div>
                                <div className="h-px bg-slate-100"></div>
                                <div className="py-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-6 py-4 text-[15px] text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                                    >
                                        Log out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 h-[calc(100vh-64px)] bg-white border-r border-slate-200 sticky top-16 hidden lg:block overflow-y-auto">
                    <div className="p-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
                        >
                            <span className="material-icons-outlined">add</span>
                            New Session
                        </button>
                    </div>
                    <nav className="mt-2">
                        <a className="flex items-center gap-3 px-6 py-3 bg-blue-50 text-primary border-r-4 border-primary transition-all" href="#">
                            <span className="material-icons-outlined text-[20px]">dashboard</span>
                            <span className="font-medium">Dashboard</span>
                        </a>
                    </nav>
                </aside>

                <main className="flex-1 p-8 lg:p-10 max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-slate-800 mb-8">Welcome to Preply!</h1>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Mock Interview Progress */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-800">Latest Mock Interview</h3>
                                <span className="material-icons-outlined text-slate-400 cursor-pointer">arrow_forward</span>
                            </div>
                            <div className="flex items-center gap-6 mb-6">
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg viewBox="0 0 96 96" className="w-full h-full transform -rotate-90 overflow-visible">
                                        <circle className="text-slate-100" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="6"></circle>
                                        <circle className="text-primary" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.32" strokeDashoffset="62.83" strokeWidth="6"></circle>
                                    </svg>
                                    <span className="absolute text-2xl font-bold text-slate-800">75</span>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Senior Frontend Engineer</p>
                                    <p className="text-lg font-bold text-slate-800">Tech Solutions Inc.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-y-3">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Confidence
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Tech Knowledge
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                    Conciseness
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                    Body Language
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Structure
                                </div>
                            </div>
                        </div>

                        {/* Tracker */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="material-icons-outlined text-slate-800">assessment</span>
                                    <h3 className="font-bold text-slate-800">Interview Tracker</h3>
                                </div>
                                <span className="material-icons-outlined text-slate-400 cursor-pointer">arrow_forward</span>
                            </div>
                            <p className="text-slate-600 text-sm mb-4">Next Interview</p>
                            <div className="flex-1 flex flex-col items-center justify-center py-6">
                                <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                    <span className="material-icons-outlined text-primary text-4xl">calendar_month</span>
                                </div>
                                <p className="text-slate-500">No upcoming interview</p>
                            </div>
                        </div>

                        {/* AI Feedback */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="material-icons-outlined text-primary">analytics</span>
                                <h3 className="font-bold text-slate-800">AI Feedback</h3>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <p className="text-slate-600 mb-6 leading-relaxed">
                                    Analyze your voice and tone to match the company's culture and values.
                                </p>
                                <button className="px-6 py-2 border-2 border-primary bg-white text-primary font-bold rounded-lg hover:bg-blue-50 transition-all">
                                    Start AI Analysis
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 p-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                        <span className="material-icons-outlined text-6xl mb-4">videocam_off</span>
                        <p className="text-lg font-medium">No recent practice sessions found</p>
                        <p className="text-sm mt-1">Start a new session to see your performance history here.</p>
                    </div>
                </main>
            </div>

            {/* NEW SESSION MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden relative">
                        {/* Close Button */}
                        <button
                            onClick={resetModal}
                            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all z-20"
                        >
                            <span className="material-icons-outlined text-[22px]">close</span>
                        </button>

                        <div className="p-6">
                            {modalStep === 1 && (
                                <div className="animate-in slide-in-from-bottom-4 duration-500">
                                    <h2 className="text-xl font-bold text-slate-800 mb-4 uppercase tracking-wider">New Session</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Job Description</label>
                                            <textarea
                                                className="w-full h-20 max-h-40 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm overflow-y-auto scrollbar-thin"
                                                placeholder="Paste the job description here..."
                                                value={formData.jobDescription}
                                                onChange={(e) => {
                                                    e.target.style.height = "auto";
                                                    e.target.style.height = e.target.scrollHeight + "px";
                                                    setFormData({ ...formData, jobDescription: e.target.value });
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Resume</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Use Default Option */}
                                                <button
                                                    onClick={() => setFormData({ ...formData, resume: { name: 'My_Default_Resume.pdf', isDefault: true } })}
                                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 group ${formData.resume?.isDefault
                                                        ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10'
                                                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                                                        }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${formData.resume?.isDefault ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400 group-hover:bg-slate-300'
                                                        }`}>
                                                        <span className="material-icons-outlined text-xl">description</span>
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="text-xs font-bold block">Use Default</span>
                                                        <span className="text-[10px] opacity-70">My_Resume.pdf</span>
                                                    </div>
                                                </button>

                                                {/* Upload New Option */}
                                                <div className={`relative rounded-xl border-2 border-dashed transition-all group ${formData.resume && !formData.resume.isDefault
                                                    ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10'
                                                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                                                    }`}>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        id="resume-upload"
                                                        onChange={(e) => {
                                                            if (e.target.files[0]) {
                                                                setFormData({ ...formData, resume: e.target.files[0] });
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor="resume-upload" className="cursor-pointer p-4 flex flex-col items-center justify-center gap-2 w-full h-full">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${formData.resume && !formData.resume.isDefault ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400 group-hover:bg-slate-300'
                                                            }`}>
                                                            <span className="material-icons-outlined text-xl">cloud_upload</span>
                                                        </div>
                                                        <div className="text-center overflow-hidden w-full">
                                                            <span className="text-xs font-bold block">Upload New</span>
                                                            <span className="text-[10px] opacity-70 truncate block px-2">
                                                                {formData.resume && !formData.resume.isDefault ? formData.resume.name : "PDF or DOCX"}
                                                            </span>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">CV</label>
                                            <textarea
                                                className="w-full h-20 max-h-40 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm overflow-y-auto scrollbar-thin"
                                                placeholder="Paste your curriculum vitae content..."
                                                value={formData.cv}
                                                onChange={(e) => {
                                                    e.target.style.height = "auto";
                                                    e.target.style.height = e.target.scrollHeight + "px";
                                                    setFormData({ ...formData, cv: e.target.value });
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={nextStep}
                                            className="px-10 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            )}

                            {modalStep === 2 && (
                                <div className="animate-in slide-in-from-right-4 duration-500">
                                    <h2 className="text-xl font-bold text-slate-800 mb-8 text-center uppercase tracking-widest">Customize Your Session</h2>

                                    <div className="space-y-8">
                                        {/* Row 1: Interviewer */}
                                        <div className="text-center">
                                            <label className="block text-xs font-bold text-slate-500 mb-6 uppercase tracking-[0.2em]">1. Choose Your Interviewer</label>
                                            <div className="flex justify-center gap-6">
                                                {interviewers.map((person) => (
                                                    <button
                                                        key={person.name}
                                                        onClick={() => setFormData({ ...formData, interviewer: person.name })}
                                                        className={`group flex flex-col items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${formData.interviewer === person.name
                                                            ? 'bg-primary/10'
                                                            : 'hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm ${formData.interviewer === person.name
                                                            ? 'bg-primary text-white scale-110 ring-4 ring-primary/20'
                                                            : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                                            }`}>
                                                            <span className="material-icons-outlined text-3xl">{person.icon}</span>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className={`font-bold text-sm transition-colors ${formData.interviewer === person.name ? 'text-primary' : 'text-slate-600'
                                                                }`}>{person.name}</div>
                                                            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{person.role}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="h-px bg-slate-100 mx-10"></div>

                                        {/* Row 2: Difficulty */}
                                        <div>
                                            <label className="block text-center text-xs font-bold text-slate-500 mb-4 uppercase tracking-[0.2em]">2. Difficulty Level</label>
                                            <div className="flex justify-center gap-4">
                                                {['easy', 'intermediate', 'hard'].map((level) => (
                                                    <button
                                                        key={level}
                                                        onClick={() => setFormData({ ...formData, difficulty: level })}
                                                        className={`flex-1 max-w-[140px] py-3 rounded-xl border-2 transition-all font-bold text-sm capitalize ${formData.difficulty === level
                                                            ? 'border-primary bg-primary/5 text-primary shadow-md shadow-primary/5'
                                                            : 'border-slate-100 hover:border-slate-200 text-slate-400'
                                                            }`}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Row 3: Questions */}
                                        <div>
                                            <label className="block text-center text-xs font-bold text-slate-500 mb-4 uppercase tracking-[0.2em]">3. Amount of Questions</label>
                                            <div className="flex justify-center gap-4">
                                                {[5, 10, 15].map((count) => (
                                                    <button
                                                        key={count}
                                                        onClick={() => setFormData({ ...formData, questionCount: count })}
                                                        className={`flex-1 max-w-[140px] py-3 rounded-xl border-2 transition-all font-bold text-sm ${formData.questionCount === count
                                                            ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                                                            : 'border-slate-100 hover:border-slate-200 text-slate-400'
                                                            }`}
                                                    >
                                                        {count} Questions
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex justify-between items-center">
                                        <button
                                            onClick={prevStep}
                                            className="px-8 py-3 bg-primary text-white font-bold rounded-xl 
                                                hover:bg-primary/90 transition-all 
                                                shadow-lg shadow-primary/20
                                                flex items-center justify-center gap-2"
                                        >
                                            <span className="material-icons-outlined text-xl">
                                                arrow_back
                                            </span>
                                            Back
                                        </button>
                                        <button
                                            onClick={nextStep}
                                            className="px-10 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            )}

                            {modalStep === 3 && (
                                <div className="py-20 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                                    <div className="relative w-20 h-20 mb-8">
                                        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Preparing your session...</h3>
                                    <p className="text-slate-500 animate-pulse text-sm">Our AI is analyzing your data</p>
                                </div>
                            )}

                            {modalStep === 4 && (
                                <div className="py-20 flex flex-col items-center justify-center animate-in zoom-in-110 duration-700">
                                    <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center italic"> Click when you are ready!</h3>
                                    <button
                                        onClick={() => {
                                            window.open('/interview', '_blank');
                                            resetModal();
                                        }}
                                        className="px-16 py-5 bg-primary text-white text-xl font-black rounded-full hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 uppercase tracking-widest"
                                    >
                                        Start Interview
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
