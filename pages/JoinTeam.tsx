import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { Hash, ChevronLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import teamService from '../services/team.service';

const JoinTeam: React.FC = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [code, setCode] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleJoin = async () => {
        if (!code || code.trim().length === 0) return setErrorMsg('Please enter a valid code');
        setStatus('loading');
        setErrorMsg(null);
        try {
            await teamService.joinTeam(code.trim().toUpperCase());
            setStatus('success');
            setTimeout(() => navigate('/dashboard/teams'), 900);
        } catch (err: any) {
            console.error('Join failed', err);
            setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to join team');
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <DashboardLayout>
                <div className="h-[80vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                     {/* Confetti-like elements can be added here with CSS */}
                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <CheckCircle2 size={48} />
                    </div>
                    <h1 className="text-4xl font-heading text-gray-900 mb-2">Welcome Aboard!</h1>
                    <p className="text-gray-500">You have successfully joined the team.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-xl mx-auto py-16">
                <button 
                    onClick={() => navigate(-1)} 
                    disabled={status !== 'idle'}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-bold text-sm disabled:opacity-50"
                >
                    <ChevronLeft size={20} /> Back
                </button>

                <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl shadow-gray-200/50 text-center relative overflow-hidden">
                    
                    {status === 'loading' && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                            <Loader2 size={40} className="text-primary animate-spin mb-4" />
                            <p className="font-bold text-gray-900">Verifying Code...</p>
                        </div>
                    )}

                    <div className="w-20 h-20 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Hash size={40} />
                    </div>
                    
                    <h1 className="text-3xl font-heading text-gray-900 mb-2">Join a Squad</h1>
                    <p className="text-gray-500 mb-8">Enter the 6-character invitation code shared by your team leader.</p>

                    <div className="space-y-4">
                        <input 
                            value={code}
                            onChange={e => setCode(e.target.value.toUpperCase())}
                            type="text" 
                            placeholder="e.g. X7K9P2" 
                            className="w-full px-6 py-4 text-center text-2xl tracking-widest uppercase bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-primary transition-colors font-bold text-gray-900"
                            maxLength={6}
                        />

                        <button 
                            onClick={handleJoin}
                            disabled={status === 'loading'}
                            className="w-full py-4 bg-gray-900 disabled:opacity-60 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                        >
                            {status === 'loading' ? (<Loader2 className="animate-spin"/>) : 'Join Team'} <ArrowRight size={20} />
                        </button>

                        {errorMsg && (<div className="text-sm text-red-500 text-center">{errorMsg}</div>)}
                    </div>

                    <p className="text-xs text-gray-400 mt-6">
                        Don't have a code? Ask your team leader or <span className="text-primary cursor-pointer hover:underline" onClick={() => navigate('/dashboard/teams/create')}>create your own team</span>.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default JoinTeam;