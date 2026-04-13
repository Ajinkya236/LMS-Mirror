
import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, FilterIcon, ChevronDownIcon } from '../components/Icons';

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
  const [activeView, setActiveView] = useState<'my' | 'all'>('my');

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const calendarData = [
    [28, 29, 30, 31, 1, 2, 3],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, 31]
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-[380px] bg-white border-r border-gray-200 p-8 flex flex-col gap-10 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto shadow-inner">
        {/* Toggle Switch */}
        <div className="bg-r-blue/10 p-1.5 rounded-full flex">
          <button 
            onClick={() => setActiveView('my')}
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${activeView === 'my' ? 'bg-subnav-blue text-white shadow-lg scale-105' : 'text-subnav-blue hover:bg-white/50'}`}
          >
            My Schedule
          </button>
          <button 
            onClick={() => setActiveView('all')}
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${activeView === 'all' ? 'bg-subnav-blue text-white shadow-lg scale-105' : 'text-subnav-blue hover:bg-white/50'}`}
          >
            All Listings
          </button>
        </div>

        {/* Mini Calendar */}
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8 px-2">
            <button className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeftIcon className="w-4 h-4 text-gray-400" /></button>
            <h2 className="text-xl font-heading font-bold text-subnav-blue">January 2026</h2>
            <button className="p-1 hover:bg-gray-100 rounded-full"><ChevronRightIcon className="w-4 h-4 text-gray-400" /></button>
          </div>
          
          <div className="grid grid-cols-7 gap-y-6 text-center">
            {days.map(d => (
              <span key={d} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{d}</span>
            ))}
            {calendarData.flat().map((d, i) => {
                const isOtherMonth = (i < 4) || (i > 34);
                const isSelected = d === 5 && i === 5;
                return (
                    <div key={i} className="flex items-center justify-center relative">
                        <span className={`text-sm font-bold w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
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

      {/* Main Content */}
      <main className="flex-grow p-10 bg-white">
        {/* Filters Top Bar */}
        <div className="flex items-center gap-12 mb-12 border-b border-gray-100 pb-8">
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
        </div>

        {/* Date Header */}
        <h2 className="text-xl font-heading font-bold text-gray-900 mb-10 border-l-4 border-r-blue pl-6">Monday, 05 January 2026</h2>

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
      </main>
    </div>
  );
};

export default EventsPage;
