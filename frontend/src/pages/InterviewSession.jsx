import React, { useState, useEffect } from 'react';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    ControlBar,
    useTracks,
    BarVisualizer,
    VideoTrack,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';

const InterviewSession = () => {
    const [token, setToken] = useState(null);
    const [url, setUrl] = useState('wss://YOUR_LIVEKIT_URL');

    useEffect(() => {
        // Token logic placeholder
    }, []);

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
                <div className="max-w-md w-full glassmorphism p-8 rounded-2xl border border-white/10 shadow-2xl text-center">
                    <div className="mb-6">
                        <img src="/logo.png" className="w-[150px] mx-auto opacity-80" alt="logo" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Connect to Interview</h2>
                    <p className="text-slate-400 mb-8">Please provide your LiveKit details to start the session.</p>

                    <div className="space-y-4 text-left">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">LiveKit URL</label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Access Token</label>
                            <textarea
                                rows="4"
                                value={token || ''}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Paste your LiveKit token here..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs"
                            />
                        </div>
                        <button
                            onClick={() => { if (token && url) window.location.reload() }}
                            className="w-full py-3 bg-primary hover:opacity-90 rounded-lg font-bold transition-all shadow-lg shadow-primary/20"
                        >
                            Start Session
                        </button>
                    </div>

                    <div className="mt-8 text-[10px] text-slate-500 uppercase tracking-widest border-t border-white/5 pt-4">
                        Powered by LiveKit & Deepgram
                    </div>
                </div>
            </div>
        );
    }

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={url}
            connectOptions={{ autoSubscribe: true }}
            data-lk-theme="default"
            className="h-screen bg-slate-950 flex flex-col overflow-hidden font-display"
        >
            <header className="h-16 px-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" className="h-8 opacity-90" alt="logo" />
                    <div className="h-4 w-px bg-white/20"></div>
                    <span className="text-slate-200 text-sm font-bold tracking-wider uppercase">Live Interview Session</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Live</span>
                    </div>
                    <button
                        onClick={() => window.close()}
                        className="flex items-center gap-2 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                        <span className="material-icons-outlined text-lg">logout</span>
                        <span className="text-xs font-bold uppercase tracking-wider">End Call</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden p-6 gap-6">
                {/* Left Side: Local Participant */}
                <section className="flex-1 relative rounded-2xl overflow-hidden bg-slate-900 border border-white/5 shadow-[0_0_50px_-20px_rgba(0,0,0,0.5)] group">
                    <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-2">
                        <span className="material-icons-outlined text-sm text-primary">person</span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Candidate</span>
                    </div>

                    <div className="h-full w-full flex items-center justify-center">
                        <MyVideoRenderer />
                    </div>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <ControlBar variation="minimal" controls={{ leave: false, settings: true }} className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2" />
                    </div>
                </section>

                {/* Right Side: LiveKit Agent */}
                <section className="flex-1 relative rounded-2xl overflow-hidden bg-slate-900 border border-white/5 shadow-[0_0_50px_-20px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center">
                    <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-2">
                        <span className="material-icons-outlined text-sm text-purple-400">auto_awesome</span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">AI Interviewer</span>
                    </div>

                    <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center relative z-[1]">
                        <AgentVisualizer />

                        <div className="mt-12 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <h3 className="text-2xl font-bold text-white mb-3">Sarah</h3>
                            <div className="h-0.5 w-12 bg-primary mx-auto mb-4 rounded-full"></div>
                            <p className="text-slate-400 text-sm leading-relaxed font-medium">
                                Technical Recruiter Agent
                            </p>
                        </div>
                    </div>

                    {/* Dynamic background effect */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03)_0%,transparent_70%)]"></div>
                </section>
            </main>

            <RoomAudioRenderer />
        </LiveKitRoom>
    );
};

const MyVideoRenderer = () => {
    const tracks = useTracks([
        { source: Track.Source.Camera, name: 'camera' },
    ], { onlySubscribed: false });

    const localTrack = tracks.find(t => t.participant.isLocal);

    if (!localTrack) {
        return <div className="text-slate-500 italic font-medium">Connecting camera...</div>;
    }

    return (
        <VideoTrack
            trackRef={localTrack}
            className="w-full h-full object-cover"
        />
    );
};

const AgentVisualizer = () => {
    const tracks = useTracks([
        { source: Track.Source.Microphone, name: 'microphone' },
    ], { onlySubscribed: true });

    // Filter for the agent's audio track (usually not local)
    const agentTrack = tracks.find(t => !t.participant.isLocal);

    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Glow behind */}
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full animate-pulse"></div>

            {/* Outer Ring */}
            <div className="absolute inset-0 border-2 border-white/10 rounded-full"></div>

            {/* Visualizer content */}
            <div className="w-48 h-48 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
                {agentTrack ? (
                    <BarVisualizer
                        trackRef={agentTrack}
                        barCount={30}
                        className="w-full h-full p-6 text-blue-500"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-white animate-spin"></div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Waiting for Agent</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewSession;
