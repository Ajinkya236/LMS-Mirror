import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { DownloadIcon, ArrowLeftIcon, AwardIcon, AppLogoIcon } from '../components/Icons';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Breadcrumbs';

// Mock data, in a real app this would come from an API based on engagementId
const mockCertificateData: { [id: string]: any } = {
    'active1': {
        menteeName: 'Ajinkya Patil',
        mentorName: 'Priya Sharma',
        topic: 'Leadership',
        completionDate: '2024-08-15', // Assuming it just completed
    },
    'completed1': {
        menteeName: 'Ajinkya Patil',
        mentorName: 'Rohan Mehta',
        topic: 'Product Strategy',
        completionDate: '2024-05-10',
    }
};

const CertificatePage: React.FC = () => {
    const { engagementId } = useParams<{ engagementId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const userRole = location.state?.userRole || 'mentee';

    const certificateData = engagementId ? mockCertificateData[engagementId] : null;

    const journey = userRole === 'mentee' ? 'Mentee Journey' : 'Mentor Journey';
    const journeyPath = userRole === 'mentee' ? '/mentor/mentee-journey' : '/mentor/mentor-journey';
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Mentoring', path: '/mentor' },
        { label: journey, path: journeyPath },
        { label: 'Certificate', path: `/certificate/${engagementId}` },
    ];

    if (!certificateData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-r-gray-50">
                <p className="text-xl text-r-gray-700">Certificate not found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 flex items-center text-sm font-medium text-r-blue hover:underline">
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    Go Back
                </button>
            </div>
        );
    }
    
    const handleDownload = () => {
        // In a real app, this would trigger a PDF generation and download.
        // For now, we'll just log to the console.
        console.log("Downloading certificate...");
        alert("Download functionality is not implemented in this demo.");
    };

    return (
        <div className="bg-r-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>
                <div className="mb-6 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-r-gray-600 hover:text-r-gray-900">
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Back to Engagement
                    </button>
                    <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-r-blue rounded-full hover:bg-r-blue-dark">
                        <DownloadIcon className="w-4 h-4"/>
                        Download
                    </button>
                </div>

                <div className="bg-white p-8 sm:p-12 shadow-2xl rounded-lg border-4 border-r-blue-dark relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-r-blue-50 rounded-br-full opacity-50"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-r-blue-50 rounded-tl-full opacity-50"></div>

                    <div className="relative z-10 text-center">
                        <div className="flex justify-center items-center gap-4 mb-4">
                            <AppLogoIcon className="h-16 w-auto text-r-blue-dark" />
                            <h1 className="text-4xl font-heading font-bold text-r-gray-800">New LMS</h1>
                        </div>
                        
                        <h2 className="text-2xl font-semibold text-r-gray-600 mt-8 tracking-widest uppercase">
                            Certificate of Completion
                        </h2>

                        <p className="mt-8 text-lg text-r-gray-600">This certificate is proudly presented to</p>

                        <p className="text-5xl font-heading font-bold text-r-blue-dark my-4">
                            {certificateData.menteeName}
                        </p>

                        <p className="text-lg text-r-gray-600">
                            for successfully completing the mentorship program on
                        </p>

                        <p className="text-3xl font-semibold text-r-gray-800 my-4">
                            {certificateData.topic}
                        </p>

                        <p className="text-base text-r-gray-600 mt-6">
                            Under the guidance of mentor <span className="font-semibold">{certificateData.mentorName}</span>.
                        </p>
                        
                        <div className="mt-12 flex flex-col sm:flex-row justify-between items-center max-w-lg mx-auto">
                            <div className="text-center">
                                <p className="font-heading text-lg italic text-r-gray-700">Priya Sharma</p>
                                <hr className="border-t-2 border-r-gray-700 my-1"/>
                                <p className="text-sm text-r-gray-500">Program Director, Mentoring Program</p>
                            </div>
                            <AwardIcon className="w-24 h-24 text-yellow-500 my-6 sm:my-0"/>
                            <div className="text-center">
                                <p className="font-heading text-lg text-r-gray-700">{new Date(certificateData.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <hr className="border-t-2 border-r-gray-700 my-1"/>
                                <p className="text-sm text-r-gray-500">Date of Completion</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificatePage;
