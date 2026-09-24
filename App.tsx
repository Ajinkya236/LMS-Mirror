import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import SkillsPage from './pages/SkillsPage';
import AddAdditionalSkillPage from './pages/AddAdditionalSkillPage';
import RoleSkillSelfSurveyPage from './pages/RoleSkillSelfSurveyPage';
import SkillDetailsPage from './pages/SkillDetailsPage';
import CoursePlayerPage from './pages/CoursePlayerPage';
import EvaluatorDashboardPage from './pages/EvaluatorDashboardPage';
import ProctoringReportPage from './pages/ProctoringReportPage';
import EventsPage from './pages/EventsPage';
import MarkAttendancePage from './pages/MarkAttendancePage';
import AssessmentPlayerPage from './pages/AssessmentPlayerPage';
import SessionFeedbackPage from './pages/SessionFeedbackPage';
import AdminFormsPage from './pages/AdminFormsPage';
import { CreateFormPage } from './pages/CreateFormPage';
import PublicFormPage from './pages/PublicFormPage';
import LearnerFeedbackPage from './pages/LearnerFeedbackPage';
import MyLearningPage from './pages/MyLearningPage';
import ShortsPage from './pages/ShortsPage';
import ShortsSearchPage from './pages/ShortsSearchPage';
import CreatorProfilePage from './pages/CreatorProfilePage';
import ShortsModerationPage from './pages/ShortsModerationPage';
import ShortsSettingsPage from './pages/ShortsSettingsPage';
import CreateShortPage from './pages/CreateShortPage';
import ShortsTagManagementPage from './pages/ShortsTagManagementPage';
import ShortsModerationPreviewPage from './pages/ShortsModerationPreviewPage';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isShortsView = location.pathname === '/shorts' || location.pathname === '/learning-shorts' || location.pathname === '/shorts/create';

  return (
    <div className="bg-r-gray-50 min-h-screen font-sans text-r-gray-800 flex flex-col">
      <Header />
      <main className={`flex-grow ${isShortsView ? 'pt-0 md:pt-16 pb-16 md:pb-0' : 'pt-16 pb-16 md:pb-0'}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shorts" element={<ShortsPage />} />
          <Route path="/shorts/create" element={<CreateShortPage />} />
          <Route path="/shorts/search" element={<ShortsSearchPage />} />
          <Route path="/shorts/creator/:creatorId" element={<CreatorProfilePage />} />
          <Route path="/shorts/moderation" element={<ShortsModerationPage />} />
          <Route path="/shorts/moderation/preview/:shortId" element={<ShortsModerationPreviewPage />} />
          <Route path="/shorts/tags" element={<ShortsTagManagementPage />} />
          <Route path="/shorts/settings" element={<ShortsSettingsPage />} />
          <Route path="/learning-shorts" element={<ShortsPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/skills/self-survey" element={<RoleSkillSelfSurveyPage />} />
          <Route path="/skills/survey" element={<RoleSkillSelfSurveyPage />} />
          <Route path="/skills/learn/:skillId" element={<SkillDetailsPage />} />
          <Route path="/skills/details/:skillId" element={<SkillDetailsPage />} />
          <Route path="/skills/add-additional-skill" element={<AddAdditionalSkillPage />} />
          <Route path="/skills/edit-additional-skill/:skillId" element={<AddAdditionalSkillPage isEdit={true} />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/mylearning" element={<MyLearningPage />} />
          <Route path="/my-learning" element={<MyLearningPage />} />
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
          <Route path="/admin/forms" element={<AdminFormsPage />} />
          <Route path="/admin/forms/create" element={<CreateFormPage />} />
          <Route path="/admin/forms/edit/:formId" element={<CreateFormPage />} />
          <Route path="/form/native-feedback-assignment" element={<LearnerFeedbackPage />} />
          <Route path="/my-feedback" element={<LearnerFeedbackPage />} />
          <Route path="/nfb/:token" element={<PublicFormPage />} />
          <Route path="/f/:token" element={<PublicFormPage />} />
          <Route path="/certificate/:engagementId" element={<CertificatePage />} />
          <Route path="/session/:sessionId/notes" element={<SessionNotesPage />} />
        </Routes>
      </main>
      <Footer />
      <MobileFooterNav />
    </div>
  );
};

function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}

export default App;