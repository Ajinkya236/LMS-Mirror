import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Course, CarouselItem } from '../types';
import { useCarousel } from '../hooks/useCarousel';
import CourseRow from '../components/CourseRow';
import TopicButton from '../components/TopicButton';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon, AwardIcon, MessageSquareIcon, Edit2Icon, SearchIcon } from '../components/Icons';
import SkillsSelectionModal from '../components/SkillsSelectionModal';
import AspiredRoleModal from '../components/AspiredRoleModal';

const homeCarouselItems: CarouselItem[] = [
  {
    id: 1,
    badge: 'Latest Updates',
    title: 'New LMS Quick Tour',
    description: 'Welcome to the New LMS! Quick tour to navigate and familiarize yourself with the key features of the platform. Discover how to access, track your progress, and utilize new tools designed to enhance your learning experience. Watch now to get started effortlessly!',
    media: {
      type: 'video',
      src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop&q=80',
      alt: 'New LMS Tour Video',
    },
  },
  {
    id: 2,
    badge: 'New Course',
    title: 'Advanced AI for Leaders',
    description: 'Explore the cutting edge of Artificial Intelligence and its application in modern leadership and business strategy. This course is designed for executives and managers aiming to drive innovation.',
    media: {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=450&fit=crop&q=80',
      alt: 'Advanced AI Course',
    },
  }
];

// Helper to generate consistent mock data
const generateMockCourses = (count: number, categoryPrefix: string): Course[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${categoryPrefix}-${i}`,
    title: `${categoryPrefix} Topic ${i + 1}: Mastering the Skill`,
    provider: i % 2 === 0 ? 'Internal' : 'Coursera',
    imageUrl: `https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=225&fit=crop&q=80`,
    tags: ['Online']
  }));
};

const topPicksCourses: Course[] = [
    { id: 'tp-1', title: 'Cloud Fundamentals', provider: 'AWS Training', imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop&q=80', tags: ['Online'] },
    { id: 'tp-2', title: 'API Security Basics', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=225&fit=crop&q=80', tags: ['Online'] },
    { id: 'tp-3', title: 'Elasticsearch for Architects', provider: 'Elastic', imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop&q=80', tags: ['Online'] },
    { id: 'tp-4', title: 'System Design Patterns', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=225&fit=crop&q=80', tags: ['Online'] },
    { id: 'tp-5', title: 'Event-Driven Architecture', provider: 'Coursera', imageUrl: 'https://images.unsplash.com/photo-1553877522-435f05697254?w=400&h=225&fit=crop&q=80', tags: ['Online'] },
    { id: 'tp-6', title: 'Kubernetes Advanced', provider: 'Cloud Native', imageUrl: 'https://images.unsplash.com/photo-1553877522-435f05697254?w=400&h=225&fit=crop&q=80', tags: ['Online'] },
    { id: 'tp-7', title: 'Designing Resilient Systems', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=225&fit=crop&q=80', tags: ['Online'] },
    { id: 'tp-8', title: 'CI/CD at Scale', provider: 'GitLab', imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=225&fit=crop&q=80', tags: ['Online'] },
    { id: 'tp-9', title: 'OAuth Deep Dive', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=225&fit=crop&q=80', tags: ['Online'] },
    { id: 'tp-10', title: 'High Scale Microservices', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=225&fit=crop&q=80', tags: ['Online'] },
];

const jobRoleCourses: Course[] = [
    { id: 'jr-1', title: 'Enterprise Sales Excellence', provider: 'Salesforce Academy', imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=225&fit=crop&q=80', tags: ['Sales', 'Enterprise'] },
    { id: 'jr-2', title: 'Strategic Account Management', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=225&fit=crop&q=80', tags: ['Strategy', 'Accounts'] },
    { id: 'jr-3', title: 'Revenue-Focused Territory Planning', provider: 'Coursera', imageUrl: 'https://images.unsplash.com/photo-1513258496099-48162023ac90?w=400&h=225&fit=crop&q=80', tags: ['Revenue', 'Planning'] },
    { id: 'jr-4', title: 'Key Client Stakeholder Management', provider: 'LinkedIn Learning', imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=225&fit=crop&q=80', tags: ['Stakeholders', 'Management'] },
    { id: 'jr-5', title: 'Contract & Commercial Fundamentals for Sales', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=225&fit=crop&q=80', tags: ['Legal', 'Commercial'] },
    { id: 'jr-6', title: 'Consultative Selling for Digital B2B Products', provider: 'Udemy', imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop&q=80', tags: ['B2B', 'Selling'] },
    { id: 'jr-7', title: 'Sales Pipeline & Forecasting Masterclass', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop&q=80', tags: ['Analytics', 'Forecasting'] },
    { id: 'jr-8', title: 'High-Impact Sales Presentation Skills', provider: 'Global Training', imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=225&fit=crop&q=80', tags: ['Soft Skills', 'Presentation'] },
    { id: 'jr-9', title: 'Winning RFPs and Large Deal Bids', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=225&fit=crop&q=80', tags: ['Bidding', 'RFP'] },
    { id: 'jr-10', title: 'Enterprise Customer Success for Sales Leaders', provider: 'Coursera', imageUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=225&fit=crop&q=80', tags: ['Customer Success', 'Leadership'] },
];

const similarUsersCourses: Course[] = [
    { id: 'sim-1', title: 'Mobile UX for Bharat Users', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=225&fit=crop&q=80', tags: ['Online', 'UX'] },
    { id: 'sim-2', title: 'Design Systems at Scale', provider: 'Coursera', imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop&q=80', tags: ['Online', 'Design'] },
    { id: 'sim-3', title: 'Advanced Figma Mastery', provider: 'Udemy', imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&h=225&fit=crop&q=80', tags: ['Online', 'Tools'] },
    { id: 'sim-4', title: 'Interaction Design for Apps', provider: 'LinkedIn Learning', imageUrl: 'https://images.unsplash.com/photo-1553877522-435f05697254?w=400&h=225&fit=crop&q=80', tags: ['Online', 'Design'] },
    { id: 'sim-5', title: 'UX Basics Certification', provider: 'Interaction Design Foundation', imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=225&fit=crop&q=80', tags: ['Online', 'Certificate'] },
    { id: 'sim-6', title: 'User Research Essentials', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=225&fit=crop&q=80', tags: ['Online', 'Research'] },
    { id: 'sim-7', title: 'UX System Of Interactions', provider: 'Coursera', imageUrl: 'https://images.unsplash.com/photo-1553877522-435f05697254?w=400&h=225&fit=crop&q=80', tags: ['Online', 'Design'] },
    { id: 'sim-8', title: 'Design Thinking', provider: 'Stanford', imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&h=225&fit=crop&q=80', tags: ['Online', 'Process'] },
];

const trendingCourses: Course[] = [
    { id: 5, title: 'Code of Conduct', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&h=225&fit=crop&q=80', tags: ['Online', 'Mandatory'] },
    { id: 6, title: 'Creating a Respectful Workplace', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1497032205566-5089c1a73938?w=400&h=225&fit=crop&q=80', tags: ['Online', 'Mandatory'] },
    { id: 7, title: 'Anti Bribery Management System', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=225&fit=crop&q=80', tags: ['Online', 'Mandatory'] },
    { id: 8, title: 'Cyber Security Awareness', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9a2e443ee4?w=400&h=225&fit=crop&q=80', tags: ['Online', 'Mandatory'] },
    { id: 201, title: 'POSH Awareness', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=225&fit=crop&q=80', tags: ['Online', 'Mandatory'] },
];

const skills: string[] = [
    'Project Management', 'Data Analysis', 'Communication', 'Leadership', 'Python', 
    'Agile', 'Digital Marketing', 'Strategic Thinking', 'Time Management', 'Sales', 
    'Customer Service', 'Teamwork', 'React', 'Problem Solving', 'Negotiation'
];

const HomePage: React.FC = () => {
  const { currentItem, goToPrevious, goToNext, currentIndex, goToSlide } = useCarousel(homeCarouselItems, 6000);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [mySkills, setMySkills] = useState<string[]>(['Leadership', 'Data Analytics']);
  const [searchQuery, setSearchQuery] = useState('');
  const [aspiredRole, setAspiredRole] = useState('Senior Engineer');
  const [isAspiredRoleModalOpen, setIsAspiredRoleModalOpen] = useState(false);
  const navigate = useNavigate();

  // Automatic "Personalize your learning" popup has been disabled as requested.
  // The logic to set sessionStorage 'hasVisitedHomePage' remains to prevent future re-activation if desired,
  // but the call to open the modal has been removed.
  useEffect(() => {
      const hasVisited = sessionStorage.getItem('hasVisitedHomePage');
      if (!hasVisited) {
          sessionStorage.setItem('hasVisitedHomePage', 'true');
      }
  }, []);

  const handleSkillsSubmit = (data: { skills: string[]; jobDescription: string }) => {
      setMySkills(data.skills);
      console.log('User selected skills:', data.skills);
  };

  return (
    <div className="space-y-0 pb-12">
      {/* Search Bar Section */}
      <div className="bg-white pt-8 pb-4">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-r-blue focus:border-r-blue sm:text-sm"
                placeholder="Search for courses, skills, or ask a question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                  }
                }}
              />
            </div>
            <button
              onClick={() => {
                if (searchQuery.trim()) {
                  navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                }
              }}
              className="px-6 py-3 bg-r-blue text-white font-medium rounded-full hover:bg-r-blue-dark transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => {
                if (searchQuery.trim()) {
                  navigate(`/search?q=${encodeURIComponent(searchQuery)}&mode=ai`);
                } else {
                  navigate(`/search?mode=ai`);
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium rounded-full hover:from-purple-600 hover:to-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-sm text-[10px] font-bold">AI</span>
              AI Assist
            </button>
          </div>
        </div>
      </div>

      {/* Hero Carousel Section */}
      {currentItem && (
        <div className="bg-white py-12 mb-8">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <StarIcon className="w-4 h-4 mr-2" />
                  {currentItem.badge}
                </span>
                <h1 className="text-4xl font-heading font-bold text-r-gray-900 mt-4">{currentItem.title}</h1>
                <p className="mt-4 text-lg text-r-gray-600">{currentItem.description}</p>
              </div>
              <div className="flex justify-center">
                <div className="rounded-xl shadow-lg overflow-hidden w-full max-w-lg">
                  <img src={currentItem.media.src} alt={currentItem.media.alt} className="w-full h-auto object-cover" />
                  {currentItem.media.type === 'video' && (
                       <div className="bg-r-gray-800 text-white p-2 flex items-center justify-between text-sm">
                          <span>▶ 0:00 / 3:59</span>
                          <div className="flex items-center space-x-2">
                              <span>🔊</span>
                              <span>⚙️</span>
                              <span>[ ]</span>
                          </div>
                      </div>
                  )}
                </div>
              </div>
            </div>
            <button onClick={goToPrevious} className="absolute top-1/2 left-0 -translate-y-1/2 bg-white/50 hover:bg-white rounded-full p-2 shadow-md transition">
              <ChevronLeftIcon className="w-6 h-6 text-r-gray-700" />
            </button>
            <button onClick={goToNext} className="absolute top-1/2 right-0 -translate-y-1/2 bg-white/50 hover:bg-white rounded-full p-2 shadow-md transition">
              <ChevronRightIcon className="w-6 h-6 text-r-gray-700" />
            </button>
            <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 flex space-x-2">
              {homeCarouselItems.map((_, index) => (
                <button key={index} onClick={() => goToSlide(index)} className={`w-2 h-2 rounded-full ${currentIndex === index ? 'bg-r-blue' : 'bg-r-gray-300'}`}></button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Section */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-heading font-semibold">Continue Learning</h2>
              <a href="#" className="px-3 py-1 text-sm font-medium text-r-blue border border-r-blue rounded-full hover:bg-r-blue-50">View all</a>
            </div>
            <div className="mt-4 flex items-center space-x-4 p-4 bg-r-gray-50 rounded-lg">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80" alt="Code of Conduct" className="w-20 h-20 rounded-lg object-cover" />
              <div>
                <p className="text-xs text-r-gray-500">INTERNAL</p>
                <h3 className="font-heading font-semibold">Code of Conduct</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-heading font-semibold">Attendance & Actionable</h2>
              <Link to="/mark-attendance" className="px-3 py-1 text-sm font-medium text-r-blue border border-r-blue rounded-full hover:bg-r-blue-50">Mark Attendance</Link>
            </div>
            <div className="mt-4 text-center p-4">
              <MessageSquareIcon className="w-8 h-8 mx-auto text-yellow-500" />
              <h3 className="font-heading font-semibold mt-2">Feedback</h3>
              <p className="text-sm text-r-gray-500 mt-1">Give feedback on recently completed course AI Agents for Product Leaders</p>
              <button className="mt-4 px-4 py-2 text-sm font-semibold text-r-blue-dark bg-r-blue-100 rounded-full hover:bg-r-blue-200">Mark Feedback</button>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-heading font-semibold">My Rewards</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <AwardIcon className="w-10 h-10 mx-auto text-r-blue" />
                <p className="mt-2 text-xs text-r-gray-500">Rank</p>
                <p className="text-2xl font-bold">40892</p>
              </div>
              <div>
                 <StarIcon className="w-10 h-10 mx-auto text-yellow-400" />
                 <p className="mt-2 text-xs text-r-gray-500">Points</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Not Started Section */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div>
          <h2 className="text-xl font-heading font-semibold mb-4">Not Started</h2>
          <p className="text-r-gray-500">No assigned course are available</p>
        </div>
      </div>

      {/* Recommended & Categories */}
      <div className="space-y-4">
        <CourseRow title="Top picks for you" courses={topPicksCourses} />
        
        {/* a. For Your Aspired Role */}
        <CourseRow 
            title={`For Your Aspired Role: ${aspiredRole}`} 
            courses={jobRoleCourses} 
            bgClass="bg-r-gray-50"
            action={
                <button 
                    onClick={() => setIsAspiredRoleModalOpen(true)}
                    className="flex items-center gap-1 text-sm font-medium text-r-gray-500 hover:text-r-blue transition-colors"
                >
                    <Edit2Icon className="w-3 h-3" /> Edit Role
                </button>
            }
        />

        {/* c. Because you've watched "Data Analytics" */}
        <CourseRow 
            title='Because you watched "Data Analytics"' 
            courses={generateMockCourses(8, 'Data Science')} 
            bgClass="bg-white"
        />

        {/* d. Based on Skills you follow */}
        <CourseRow 
            title="Based on Skills you follow" 
            courses={generateMockCourses(8, 'Followed Skills')}
            action={
                <button 
                    onClick={() => setIsSkillsModalOpen(true)}
                    className="flex items-center gap-1 text-sm font-medium text-r-gray-500 hover:text-r-blue transition-colors"
                >
                    <Edit2Icon className="w-3 h-3" /> Edit Skills
                </button>
            }
        />

        {/* e. What similar users are learning */}
        <CourseRow 
            title="What similar users are learning" 
            courses={similarUsersCourses} 
            bgClass="bg-r-gray-50"
        />

        {/* f. Trending Now in your Job Role - WITH RANK */}
        <CourseRow 
            title="Trending Now in your Job Role" 
            courses={generateMockCourses(8, 'Role Trending')} 
            showRank={true}
        />

        {/* g. Trending Now in your Organisation - WITH RANK */}
        <CourseRow 
            title="Trending Now in your Organisation" 
            courses={generateMockCourses(8, 'Org Trending')} 
            bgClass="bg-r-gray-50"
            showRank={true}
        />

        {/* h. Newly Added */}
        <CourseRow 
            title="Newly Added" 
            courses={generateMockCourses(8, 'New Arrivals')} 
        />

        {/* Trending Global */}
        <CourseRow 
            title="Trending Courses" 
            courses={trendingCourses} 
            bgClass="bg-r-gray-50"
        />
      </div>

      {/* Explore Skills */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-xl font-heading font-semibold mb-4">Explore Skills you are interested in</h2>
        <div className="flex flex-wrap gap-3">
          <TopicButton topic="Choose my skill preferences" isPrimary onClick={() => setIsSkillsModalOpen(true)} />
          {skills.map(skill => <TopicButton key={skill} topic={skill} />)}
        </div>
      </div>

      <SkillsSelectionModal 
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        onSubmit={handleSkillsSubmit}
        initialSkills={mySkills}
      />

      <AspiredRoleModal
        isOpen={isAspiredRoleModalOpen}
        onClose={() => setIsAspiredRoleModalOpen(false)}
        currentRole={aspiredRole}
        onSave={(role) => setAspiredRole(role)}
      />
    </div>
  );
};

export default HomePage;
