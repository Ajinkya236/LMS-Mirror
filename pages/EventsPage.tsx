import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, FilterIcon, ChevronDownIcon } from '../components/Icons';
import { QrCode, ArrowRight, Eye, CheckCircle2, Search, Calendar, User, MapPin, Award, Users, Filter } from 'lucide-react';
import { mockILTSessions, ILTSession } from '../utils/instructorData';

const EventCard: React.FC<{
  time: string;
  enrollStatus: string;
  title: string;
  courseName: string;
  facilitator: string;
  type: string;
  venue: string;
  mode: string;
  logoUrl?: string;
  imageUrl?: string;
}> = ({ time, enrollStatus, title, courseName, facilitator, type, venue, mode, logoUrl, imageUrl }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex gap-8 mb-6 hover:shadow-md transition-shadow">
    <div className="w-48 h-32 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100">
      {logoUrl ? (
        <img src={logoUrl} alt="Logo" className="max-w-[80%] max-h-[80%] object-contain opacity-80" />
      ) : imageUrl ? (
        <img src={imageUrl} alt="Event" className="w-full h-full object-cover" />
      ) : (
        <div className="text-gray-300 font-bold text-xl">Event</div>
      )}
    </div>
    <div className="flex-grow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-700">{time}</span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider">{enrollStatus}</span>
        </div>
      </div>
      <h3 className="text-xl font-heading font-bold text-r-blue-dark mb-4">{title}</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-8">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Course:</p>
          <p className="text-sm font-bold text-gray-700">{courseName}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Facilitator:</p>
          <p className="text-sm font-bold text-gray-700">{facilitator}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Course Type:</p>
          <p className="text-sm font-bold text-gray-700">{type}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Venue:</p>
          <p className="text-sm font-bold text-gray-700">{venue}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mode:</p>
          <p className="text-sm font-bold text-gray-700">{mode}</p>
        </div>
      </div>
    </div>
  </div>
);

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeView, setActiveView] = useState<'my' | 'all' | 'instructor'>('my');

  // Instructor Filters State
  const [selectedAcademy, setSelectedAcademy] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('Completed');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('view') === 'instructor') {
      setActiveView('instructor');
    }
  }, [location]);

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const calendarData = [
    [28, 29, 30, 31, 1, 2, 3],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, 31]
  ];

  // Filtered Sessions for Instructor View
  const filteredInstructorSessions = mockILTSessions.filter(session => {
    const matchesAcademy = selectedAcademy === 'All' || session.academy === selectedAcademy;
    const matchesLocation = selectedLocation === 'All' || session.location === selectedLocation;
    const matchesStatus = selectedStatus === 'All' || session.status === selectedStatus;
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          session.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          session.facilitator.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesAcademy && matchesLocation && matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-[380px] bg-white border-r border-gray-200 p-6 md:p-8 flex flex-col gap-6 sticky top-16 md:h-[calc(100vh-64px)] overflow-y-auto shadow-xs">
        {/* Quick Attendance Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-blue-800 text-white rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="p-2 bg-white/10 backdrop-blur rounded-xl">
              <QrCode className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Live Session Attendance</h3>
              <p className="text-[11px] text-blue-200">Scan QR or enter 6-digit PIN</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/mark-attendance?tab=join')}
            className="w-full mt-2 py-2.5 px-4 bg-white text-indigo-900 font-bold text-xs rounded-xl shadow hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Mark Attendance</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* View Switcher Pill */}
        <div className="bg-r-blue/10 p-1.5 rounded-2xl flex flex-wrap gap-1">
          <button 
            onClick={() => setActiveView('my')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all ${activeView === 'my' ? 'bg-subnav-blue text-white shadow-md' : 'text-subnav-blue hover:bg-white/50'}`}
          >
            My Schedule
          </button>
          <button 
            onClick={() => setActiveView('all')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all ${activeView === 'all' ? 'bg-subnav-blue text-white shadow-md' : 'text-subnav-blue hover:bg-white/50'}`}
          >
            All Listings
          </button>
          <button 
            onClick={() => setActiveView('instructor')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all ${activeView === 'instructor' ? 'bg-subnav-blue text-white shadow-md' : 'text-subnav-blue hover:bg-white/50'}`}
          >
            Instructor View
          </button>
        </div>

        {/* Mini Calendar */}
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-6 px-2">
            <button className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeftIcon className="w-4 h-4 text-gray-400" /></button>
            <h2 className="text-lg font-heading font-bold text-subnav-blue">January 2026</h2>
            <button className="p-1 hover:bg-gray-100 rounded-full"><ChevronRightIcon className="w-4 h-4 text-gray-400" /></button>
          </div>
          
          <div className="grid grid-cols-7 gap-y-4 text-center">
            {days.map(d => (
              <span key={d} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{d}</span>
            ))}
            {calendarData.flat().map((d, i) => {
                const isOtherMonth = (i < 4) || (i > 34);
                const isSelected = d === 22 && i === 25; // 22 Jan 2026 completed session date
                return (
                    <div key={i} className="flex items-center justify-center relative">
                        <span className={`text-xs font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                            isSelected ? 'bg-r-blue text-white shadow-md' : 
                            isOtherMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
                        }`}>
                            {d}
                        </span>
                    </div>
                );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-10 bg-white">
        
        {/* --- INSTRUCTOR VIEW CONTENT --- */}
        {activeView === 'instructor' ? (
          <div className="space-y-8 max-w-6xl">
            {/* Top Instructor View Header */}
            <div className="bg-gradient-to-r from-nav-blue via-r-blue to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-full mb-2 inline-block border border-white/30">
                  Calendar → Instructor Management View
                </span>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                  ILT Session & Participant Roster
                </h1>
                <p className="text-blue-100 text-xs sm:text-sm mt-1">
                  Find completed, live, or upcoming sessions, inspect participant attendance logs, and review submitted feedback forms.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 flex items-center gap-3">
                <Users className="w-8 h-8 text-cyan-300" />
                <div>
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Total Sessions</p>
                  <p className="text-xl font-bold text-white">{mockILTSessions.length} Available</p>
                </div>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2 text-subnav-blue font-black uppercase text-xs tracking-wider">
                  <Filter className="w-4 h-4 text-r-blue" />
                  <span>Session Search & Filters</span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedAcademy('All');
                    setSelectedLocation('All');
                    setSelectedStatus('All');
                    setSearchTerm('');
                  }}
                  className="text-xs text-r-blue hover:underline font-bold"
                >
                  Reset Filters
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search Term */}
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">
                    Search Session
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Title, course, trainer..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-r-blue/20"
                    />
                  </div>
                </div>

                {/* Filter by Academy */}
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">
                    Academy
                  </label>
                  <select 
                    value={selectedAcademy}
                    onChange={e => setSelectedAcademy(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-r-blue/20 cursor-pointer"
                  >
                    <option value="All">All Academies</option>
                    <option value="CSD Academy">CSD Academy</option>
                    <option value="Home Academy">Home Academy</option>
                  </select>
                </div>

                {/* Filter by Location */}
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">
                    Location
                  </label>
                  <select 
                    value={selectedLocation}
                    onChange={e => setSelectedLocation(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-r-blue/20 cursor-pointer"
                  >
                    <option value="All">All Locations</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bangalore">Bangalore</option>
                  </select>
                </div>

                {/* Filter by Status */}
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">
                    Status
                  </label>
                  <select 
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-r-blue/20 cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Completed">Completed Sessions</option>
                    <option value="Live">Live Sessions</option>
                    <option value="Upcoming">Upcoming Sessions</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Session Roster Header */}
            <div className="flex items-center justify-between border-l-4 border-r-blue pl-4">
              <h2 className="text-xl font-heading font-bold text-gray-900">
                {selectedStatus === 'Completed' ? 'Completed Sessions' : `${selectedStatus} Sessions`}
              </h2>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {filteredInstructorSessions.length} Sessions Found
              </span>
            </div>

            {/* Sessions Cards List */}
            <div className="space-y-6">
              {filteredInstructorSessions.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500 space-y-3">
                  <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="font-bold text-base text-gray-700">No sessions match your filter criteria.</p>
                  <p className="text-xs text-gray-400">Try adjusting the academy, location, or status dropdown filters above.</p>
                </div>
              ) : (
                filteredInstructorSessions.map((session) => {
                  const isCompleted = session.status === 'Completed';

                  return (
                    <div 
                      key={session.id} 
                      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      <div className="space-y-3 flex-grow">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-r-blue" /> {session.date} ({session.time})
                          </span>
                          {isCompleted ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-r-blue text-[10px] font-black uppercase tracking-wider border border-blue-200">
                              {session.status}
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
                            {session.academy}
                          </span>
                        </div>

                        <h3 className="text-lg font-heading font-bold text-r-blue-dark">
                          {session.title}
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-6 text-xs text-gray-600 pt-1">
                          <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Course:</span>
                            <span className="font-bold text-gray-800">{session.courseName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Instructor:</span>
                            <span className="font-bold text-gray-800">{session.facilitator}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Venue:</span>
                            <span className="font-bold text-gray-800">{session.location} ({session.mode})</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Enrolled:</span>
                            <span className="font-bold text-gray-800">{session.participants.length} Employees</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex-shrink-0 flex items-center lg:flex-col justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6">
                        {isCompleted && (
                          <button
                            onClick={() => navigate(`/instructor/session/${session.id}`)}
                            className="w-full sm:w-auto px-6 py-2.5 bg-nav-blue hover:bg-r-blue-dark text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group"
                          >
                            <Eye className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform" />
                            <span>View Session Details</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* --- REGULAR SCHEDULE / LISTINGS VIEW --- */
          <div>
            {/* Filters Top Bar */}
            <div className="flex flex-wrap items-center gap-8 mb-8 border-b border-gray-100 pb-6">
                <button className="flex items-center gap-3 text-subnav-blue font-black uppercase text-[12px] tracking-wider hover:opacity-70 transition-opacity">
                    <FilterIcon className="w-5 h-5" />
                    Filter by academies
                </button>

                <div className="flex items-center gap-4">
                    <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Filter by Location</span>
                    <div className="relative min-w-[200px]">
                        <select className="appearance-none w-full bg-white border border-gray-200 rounded-full px-6 py-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-r-blue/20 cursor-pointer shadow-sm">
                            <option>Select</option>
                            <option>Mumbai</option>
                            <option>Bangalore</option>
                            <option>Delhi</option>
                            <option>Remote</option>
                        </select>
                        <ChevronDownIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <button 
                  onClick={() => setActiveView('instructor')}
                  className="ml-auto px-4 py-2 bg-r-blue/10 hover:bg-r-blue/20 text-r-blue font-bold rounded-xl text-xs flex items-center gap-2 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  Switch to Instructor View
                </button>
            </div>

            {/* Date Header */}
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-8 border-l-4 border-r-blue pl-6">Monday, 05 January 2026</h2>

            {/* Event List */}
            <div className="space-y-6 max-w-6xl">
              <EventCard 
                time="06:00 - 14:30"
                enrollStatus="Not Enrolled"
                title="Home_DailyBriefing_5th Jan 2026 - Session 1"
                courseName="Home_DailyBriefing_5th Jan 2026"
                facilitator="AMIT MOHANTA"
                type="Classroom With Assessment"
                venue="NHQ"
                mode="Virtual"
                logoUrl="https://upload.wikimedia.org/wikipedia/commons/5/50/Reliance_Jio_Logo.svg"
              />

              <EventCard 
                time="08:47 - 17:40"
                enrollStatus="Not Enrolled"
                title="CSD_OneJio_NHT_Day 14 - OJCE011"
                courseName="CSD_OneJio_NHT_Day 14"
                facilitator="Chaudhari Sabina"
                type="Classroom Training"
                venue="NHQ"
                mode="Hybrid"
                imageUrl="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&fit=crop&q=80"
              />

              <EventCard 
                time="09:00 - 18:00"
                enrollStatus="Not Enrolled"
                title="CSD_OneJio_NHT_Day 9"
                courseName="CSD_OneJio_NHT_Day 9"
                facilitator="Stefy Mathew"
                type="Classroom Training"
                venue="NHQ"
                mode="Virtual"
                imageUrl="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=200&fit=crop&q=80"
              />

              <EventCard 
                time="09:05 - 14:00"
                enrollStatus="Not Enrolled"
                title="Home_DailyBriefing_5th Jan 2026"
                courseName="Home_DailyBriefing_5th Jan 2026"
                facilitator="Rahul Verma"
                type="Classroom Training"
                venue="NHQ"
                mode="Virtual"
                logoUrl="https://upload.wikimedia.org/wikipedia/commons/5/50/Reliance_Jio_Logo.svg"
              />
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default EventsPage;
