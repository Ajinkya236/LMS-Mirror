
import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeftIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';

const ProctoringReportPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { reportId } = useParams<{ reportId: string }>();
    
    // State for multiple proofs viewing
    const [proofImages, setProofImages] = useState<string[] | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // In a real app, you'd fetch this based on reportId
    const data = location.state?.reportData || {
        id: reportId,
        state: 'Mumbai',
        empCode: '55077420',
        empName: 'Ajinkya Patil',
        courseId: 'C-2041',
        lessonName: 'Video Assessment (28489)',
        status: 'Pending',
        activityName: 'OJT ACTIVITY TEST (25288)'
    };

    const redFlags = [
        { id: 1, name: 'No Face', freq: 6, proof: 6 },
        { id: 2, name: 'Looking Left', freq: 4, proof: 4 },
        { id: 3, name: 'Looking Right', freq: 6, proof: 6 },
        { id: 4, name: 'Looking Up', freq: 2, proof: 2 },
        { id: 5, name: 'Looking Down', freq: 8, proof: 8 },
        { id: 6, name: 'Partial face visible', freq: 2, proof: 2 },
        { id: 7, name: 'Switched tab', freq: 3, proof: 0 },
        { id: 8, name: 'Mobile Device Detected', freq: 1, proof: 1 },
        { id: 9, name: 'Print Function', freq: 2, proof: 0 },
        { id: 10, name: 'Screenshot', freq: 2, proof: 0 },
        { id: 11, name: 'More than 2 faces visible', freq: 1, proof: 1 },
    ];

    const totalFlags = redFlags.reduce((acc, curr) => acc + curr.freq, 0);

    const openProofModal = (flagId: number, proofCount: number) => {
        // Generate a set of mock proof URLs for the selected flag
        const images = Array.from({ length: proofCount }, (_, i) => 
            `https://picsum.photos/seed/${flagId}-${i + 100}/1200/900`
        );
        setProofImages(images);
        setCurrentImageIndex(0);
    };

    const closeProofModal = () => {
        setProofImages(null);
        setCurrentImageIndex(0);
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (proofImages) {
            setCurrentImageIndex((prev) => (prev + 1) % proofImages.length);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (proofImages) {
            setCurrentImageIndex((prev) => (prev - 1 + proofImages.length) % proofImages.length);
        }
    };

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6 text-r-blue" />
                    </button>
                    <h1 className="text-2xl font-heading font-bold text-r-gray-900">Activity Proctoring Report</h1>
                </div>

                {/* Info Card */}
                <div className="flex flex-col md:flex-row gap-8 mb-10 bg-blue-50 p-8 rounded-2xl border border-blue-100 shadow-sm items-center">
                    <div className="flex-shrink-0">
                        <img 
                            src="https://picsum.photos/id/177/200/200" 
                            alt="Employee Profile" 
                            className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-sm"
                        />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6 flex-grow">
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Employee Name</p>
                            <p className="text-base font-bold text-gray-900">{data.empName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Employee Code</p>
                            <p className="text-base font-bold text-gray-900">{data.empCode}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Learning Path Name</p>
                            <p className="text-base font-bold text-gray-900">Service Professional Excellence</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Lesson Name (id)</p>
                            <p className="text-base font-bold text-gray-900">{data.lessonName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Lesson Status</p>
                            <p className="text-base font-bold text-gray-900">{data.status}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Lesson Score</p>
                            <p className="text-base font-bold text-gray-900">88/100</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Activity Name (id)</p>
                            <p className="text-base font-bold text-gray-900">{data.activityName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Course Score and Status</p>
                            <p className="text-base font-bold text-gray-900">92% <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded">PASS</span></p>
                        </div>
                    </div>
                </div>

                {/* Summary Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Proctoring Flag Summary</h3>
                    <div className="px-6 py-2.5 bg-red-100 text-red-700 font-black rounded-full text-sm shadow-sm">
                        Total Red Flag Events: {totalFlags}
                    </div>
                </div>

                {/* Flags Table */}
                <div className="border border-r-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-r-blue text-white">
                                <th className="px-6 py-4 font-bold border-r border-white/20 w-24">Srl. No.</th>
                                <th className="px-6 py-4 font-bold border-r border-white/20">Red Flag Description</th>
                                <th className="px-6 py-4 font-bold border-r border-white/20 text-center w-40">Frequency</th>
                                <th className="px-6 py-4 font-bold text-center w-56">Visual Proof / Photo</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {redFlags.map((flag) => (
                                <tr key={flag.id} className="border-t hover:bg-gray-50 text-black">
                                    <td className="px-6 py-4 border-r text-black">{flag.id}</td>
                                    <td className="px-6 py-4 border-r font-bold text-black">{flag.name}</td>
                                    <td className="px-6 py-4 border-r text-center font-black text-red-600">{flag.freq}</td>
                                    <td className="px-6 py-4 text-center">
                                        {flag.proof > 0 ? (
                                            <button 
                                                onClick={() => openProofModal(flag.id, flag.proof)}
                                                className="text-r-blue font-bold hover:underline bg-blue-50 px-4 py-1.5 rounded-full transition-all"
                                            >
                                                View {flag.proof} Proof(s)
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 italic">No proof available</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-12 pt-8 border-t flex justify-end">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="px-10 py-3 bg-white border border-r-gray-300 rounded-full text-base font-bold text-r-gray-700 hover:bg-r-gray-50 shadow-sm transition-all"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>

            {/* Proof Gallery Modal */}
            {proofImages && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-[100] flex justify-center items-center p-4 overflow-hidden" onClick={closeProofModal}>
                    {/* Image Counter Badge */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-white text-sm font-bold z-20">
                        Photo {currentImageIndex + 1} of {proofImages.length}
                    </div>

                    {/* Close Button */}
                    <button 
                        onClick={closeProofModal} 
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white z-20"
                        title="Close Gallery"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>

                    <div className="relative w-full max-w-5xl h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                        
                        {/* Navigation: Previous */}
                        <button 
                            onClick={prevImage}
                            className="absolute left-0 lg:-left-20 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white group z-20 backdrop-blur-sm"
                            title="Previous Photo"
                        >
                            <ChevronLeftIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        </button>

                        {/* Main Image Container */}
                        <div className="relative w-full aspect-video bg-black/40 rounded-3xl overflow-hidden shadow-2xl border border-white/5">
                            <img 
                                src={proofImages[currentImageIndex]} 
                                alt={`Proof ${currentImageIndex + 1}`} 
                                className="w-full h-full object-contain animate-fade-in"
                            />
                            
                            {/* Inner Info Overlay */}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-center">
                                <p className="text-white font-medium">Timestamp: 12-08-2023 | 11:04:{22 + currentImageIndex} AM</p>
                                <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest font-black">Visual Proof Log ID: PR-{reportId}-{currentImageIndex + 1001}</p>
                            </div>
                        </div>

                        {/* Navigation: Next */}
                        <button 
                            onClick={nextImage}
                            className="absolute right-0 lg:-right-20 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white group z-20 backdrop-blur-sm"
                            title="Next Photo"
                        >
                            <ChevronRightIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProctoringReportPage;
