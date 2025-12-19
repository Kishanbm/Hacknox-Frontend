import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JudgeLayout } from '../../components/JudgeLayout';
import { 
    ChevronLeft, ExternalLink, Github, Video, Save, Send, Flag, 
    Maximize2, FileText, AlertTriangle, CheckCircle2 
} from 'lucide-react';

const JudgeEvaluation: React.FC = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [scores, setScores] = useState({
        innovation: 0,
        complexity: 0,
        design: 0,
        utility: 0
    });
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalScore = Object.values(scores).reduce((a: number, b: number) => a + b, 0);

    const handleScoreChange = (criteria: keyof typeof scores, value: number) => {
        setScores(prev => ({ ...prev, [criteria]: value }));
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            navigate('/judge/assignments');
        }, 1500);
    };

    return (
        <JudgeLayout>
            <div className="h-[calc(100vh-140px)] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/judge/assignments')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-gray-900">NeuroNet Evaluation</h1>
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">HACKONX 2025</span>
                            </div>
                            <p className="text-xs text-gray-500">Team: Alpha Squad • Track: AI/ML</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-2">
                            <Save size={16} /> Save Draft
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-[#24FF00] text-black rounded-lg text-sm font-bold hover:bg-[#1fe600] shadow-lg shadow-[#24FF00]/20 flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : (
                                <><Send size={16} /> Submit Score</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Split View */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                    
                    {/* LEFT: Project Content */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <FileText size={18} /> Submission Details
                            </h3>
                            <button className="text-gray-400 hover:text-gray-600" title="Expand">
                                <Maximize2 size={18} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            {/* Video Embed Mock */}
                            <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center text-gray-500 relative group cursor-pointer overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#5425FF]/20 to-transparent"></div>
                                <Video size={48} className="relative z-10" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold z-20">
                                    Play Demo
                                </div>
                            </div>

                            {/* Links */}
                            <div className="flex gap-3">
                                <a href="#" className="flex-1 p-3 border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-700 hover:border-[#5425FF] hover:text-[#5425FF] transition-colors font-bold text-sm">
                                    <Github size={18} /> View Repository
                                </a>
                                <a href="#" className="flex-1 p-3 border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-700 hover:border-[#5425FF] hover:text-[#5425FF] transition-colors font-bold text-sm">
                                    <ExternalLink size={18} /> Live Demo
                                </a>
                            </div>

                            {/* Description */}
                            <div className="prose prose-gray max-w-none">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Project Description</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    NeuroNet is a revolutionary tool designed to visualize complex neural network architectures in real-time. 
                                    By leveraging WebGL and custom shader pipelines, we enable students and researchers to "step inside" their models 
                                    and understand data flow intuitively.
                                </p>
                                <p className="text-gray-600 text-sm leading-relaxed mt-4">
                                    Our tech stack includes React for the frontend, Three.js for 3D rendering, and a Python Flask backend that 
                                    interfaces with PyTorch models to stream activation data.
                                </p>
                            </div>

                            {/* Tech Stack Chips */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Technologies</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['React', 'Three.js', 'Python', 'PyTorch', 'WebGL'].map(t => (
                                        <span key={t} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* RIGHT: Scoring Form */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">Evaluation Rubric</h3>
                            <div className="text-sm font-bold">
                                Total Score: <span className="text-[#5425FF] text-lg font-heading">{totalScore}</span>/40
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            
                            {/* Rubric Items */}
                            {[
                                { id: 'innovation', label: 'Innovation & Creativity', desc: 'How unique is the solution? Does it solve the problem in a novel way?' },
                                { id: 'complexity', label: 'Technical Complexity', desc: 'Quality of code, architecture, and technical implementation.' },
                                { id: 'design', label: 'Design & UX', desc: 'Is the solution user-friendly and visually appealing?' },
                                { id: 'utility', label: 'Utility & Impact', desc: 'Potential real-world impact and usefulness.' },
                            ].map((item) => (
                                <div key={item.id}>
                                    <div className="flex justify-between mb-2">
                                        <label className="font-bold text-gray-900">{item.label}</label>
                                        <span className="text-sm font-bold text-[#5425FF]">
                                            {scores[item.id as keyof typeof scores]}/10
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3">{item.desc}</p>
                                    <div className="relative h-2 bg-gray-100 rounded-lg">
                                        <input 
                                            type="range" min="0" max="10" step="1" 
                                            value={scores[item.id as keyof typeof scores]}
                                            onChange={(e) => handleScoreChange(item.id as keyof typeof scores, parseInt(e.target.value))}
                                            className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-[#5425FF] rounded-lg pointer-events-none transition-all duration-150"
                                            style={{ width: `${scores[item.id as keyof typeof scores] * 10}%` }}
                                        ></div>
                                        <div 
                                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#5425FF] rounded-full shadow-md pointer-events-none transition-all duration-150"
                                            style={{ left: `calc(${scores[item.id as keyof typeof scores] * 10}% - 8px)` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-bold uppercase">
                                        <span>Poor</span>
                                        <span>Average</span>
                                        <span>Excellent</span>
                                    </div>
                                </div>
                            ))}

                            <hr className="border-gray-100" />

                            {/* Feedback */}
                            <div>
                                <label className="block font-bold text-gray-900 mb-2">Qualitative Feedback</label>
                                <textarea 
                                    rows={4} 
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] transition-colors text-sm"
                                    placeholder="Provide constructive feedback for the team..."
                                ></textarea>
                            </div>

                            {/* Danger Zone / Flag */}
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                                    <AlertTriangle size={16} /> Report Submission
                                </div>
                                <button className="text-xs font-bold text-red-600 hover:underline">Flag as Inappropriate</button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </JudgeLayout>
    );
};

export default JudgeEvaluation;