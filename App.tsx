import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileFooterNav from './components/MobileFooterNav';
import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import MentorPage from './pages/MentorPage';
import MenteeJourneyPage from './pages/MenteeJourneyPage';
import MentorSearchPage from './pages/MentorSearchPage';
import MentorListPage from './pages/MentorListPage';
import MentorJourneyPage from './pages/MentorJourneyPage';
import MentorshipEngagementPage from './pages/MentorshipEngagementPage';
import AssignCoursesPage from './pages/AssignCoursesPage';
import ProgramDetailsPage from './pages/ProgramDetailsPage';
import ProgramTrackingPage from './pages/ProgramTrackingPage';
import CertificatePage from './pages/CertificatePage';
import MentorProgramSearchPage from './pages/MentorProgramSearchPage';
import ProgramEngagementPage from './pages/ProgramEngagementPage';
import MenteeProgramProgressPage from './pages/MenteeProgramProgressPage';
import CreateProgramPage from './pages/CreateProgramPage';
import MentorDetailsPage from './pages/MentorDetailsPage';
import SessionDetailsPage from './pages/SessionDetailsPage';
import EndProgramPage from './pages/EndProgramPage';
import MenteePreferencesPage from './pages/MenteePreferencesPage';
import MentorPreferencesPage from './pages/MentorPreferencesPage';
import SessionNotesPage from './pages/SessionNotesPage';
import SearchResultsPage from './pages/SearchResultsPage';
import CategoryDetailsPage from './pages/CategoryDetailsPage';
import CoursePlayerPage from './pages/CoursePlayerPage';
import EvaluatorDashboardPage from './pages/EvaluatorDashboardPage';
import ProctoringReportPage from './pages/ProctoringReportPage';
import EventsPage from './pages/EventsPage';
import MarkAttendancePage from './pages/MarkAttendancePage';
import AssessmentPlayerPage from './pages/AssessmentPlayerPage';
import SessionFeedbackPage from './pages/SessionFeedbackPage';

function App() {
  return (
    <HashRouter>
      <div className="bg-r-gray-50 min-h-screen font-sans text-r-gray-800 flex flex-col">
        <Header />
        <main className="flex-grow pt-16 pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/category/:categoryId" element={<CategoryDetailsPage />} />
            <Route path="/course/:courseId" element={<CoursePlayerPage />} />
            <Route path="/evaluation" element={<EvaluatorDashboardPage />} />
            <Route path="/evaluation/proctoring-report/:reportId" element={<ProctoringReportPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/mark-attendance" element={<MarkAttendancePage />} />
            <Route path="/assessment/:sessionId" element={<AssessmentPlayerPage />} />
            <Route path="/feedback/:sessionId" element={<SessionFeedbackPage />} />
            <Route path="/mentor" element={<MentorPage />} />
            <Route path="/mentor/mentee-journey" element={<MenteeJourneyPage />} />
            <Route path="/mentor/mentee-journey/preferences" element={<MenteePreferencesPage />} />
            <Route path="/mentor/mentor-journey" element={<MentorJourneyPage />} />
            <Route path="/mentor/mentor-journey/preferences" element={<MentorPreferencesPage />} />
            <Route path="/mentor/program-manager" element={<MentorJourneyPage isProgramManagerView={true} />} />
            <Route path="/mentor/program-manager/create" element={<CreateProgramPage />} />
            <Route path="/mentor/program-manager/track/:programId" element={<ProgramTrackingPage />} />
            <Route path="/mentor/program-manager/track/:programId/pair/:pairId" element={<SessionDetailsPage />} />
            <Route path="/mentor/program-manager/end-program/:programId" element={<EndProgramPage />} />
            <Route path="/mentor/details/:mentorId" element={<MentorDetailsPage />} />
            <Route path="/mentor/search" element={<MentorSearchPage />} />
            <Route path="/mentor/program-search" element={<MentorProgramSearchPage />} />
            <Route path="/mentor/topic/:topicId" element={<MentorListPage />} />
            <Route path="/mentor/topic/:topicId" element={<MentorListPage />} />
            <Route path="/mentor/engagement/:engagementId" element={<MentorshipEngagementPage />} />
            <Route path="/mentor/assign-courses" element={<AssignCoursesPage />} />
            <Route path="/program/:programId" element={<ProgramDetailsPage />} />
            <Route path="/program-engagement/:programId" element={<ProgramEngagementPage />} />
            <Route path="/program-engagement/:programId/mentee/:menteeId" element={<MenteeProgramProgressPage />} />
            <Route path="/certificate/:engagementId" element={<CertificatePage />} />
            <Route path="/session/:sessionId/notes" element={<SessionNotesPage />} />
          </Routes>
        </main>
        <Footer />
        <MobileFooterNav />
      </div>
    </HashRouter>
  );
}

export default App;