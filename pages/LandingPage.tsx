import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Gift, Cpu, Database, Globe, Shield, Leaf, Lightbulb, ChevronRight, Settings } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-purple-200">
      
      {/* Top Banner */}
      <div className="bg-purple-700 text-white text-center py-2 text-sm font-medium">
        Hackathon begins in: 05 Days 12 Hours 46 Minutes
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="font-pixel text-3xl tracking-widest text-black">HACKON</span>
              <span className="font-pixel text-3xl tracking-widest text-purple-600">X</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-gray-600 hover:text-purple-600 font-medium">About</a>
              <a href="#locations" className="text-gray-600 hover:text-purple-600 font-medium">Locations</a>
              <a href="#prizes" className="text-gray-600 hover:text-purple-600 font-medium">Prizes</a>
              <a href="#faq" className="text-gray-600 hover:text-purple-600 font-medium">FAQ</a>
              
              <div className="h-6 w-px bg-gray-300"></div>

              <Link to="/judge/dashboard" className="text-gray-600 hover:text-amber-600 font-bold text-sm">
                Judge Portal
              </Link>
              <Link to="/admin/dashboard" className="text-gray-600 hover:text-red-600 font-bold text-sm flex items-center gap-1">
                 Organizer Login
              </Link>

              <Link to="/dashboard" className="bg-purple-600 text-white px-6 py-2 rounded-full font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">
                Dashboard Demo
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-32 overflow-hidden bg-gray-50">
        {/* Abstract 3D Shapes (Simulated with CSS) */}
        <div className="absolute top-20 left-10 w-8 h-8 rounded-full bg-green-400 blur-sm animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-400/20 transform rotate-45 rounded-xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <p className="text-gray-500 mb-4 font-medium tracking-wide">March XX – April XX</p>
          
          <h1 className="text-6xl md:text-8xl font-pixel mb-6 tracking-tight">
            HACKON<span className="text-purple-600 relative inline-block">
                X
                <div className="absolute -top-2 -right-4 w-4 h-4 bg-green-400 rounded-full"></div>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
            India's Multi-State HPC Hackathon
          </p>
          
          <div className="flex justify-center gap-12 mb-12 text-center">
             <div>
                <div className="text-purple-600 font-bold text-xl">5+</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Cities</div>
             </div>
             <div>
                <div className="text-purple-600 font-bold text-xl">36</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Hours</div>
             </div>
             <div>
                <div className="text-purple-600 font-bold text-xl">Offline</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Type</div>
             </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link to="/signup" className="bg-purple-600 text-white px-8 py-3 rounded-md font-bold shadow-lg hover:bg-purple-700 hover:-translate-y-1 transition-all">
              Register Now
            </Link>
            <Link to="/login" className="bg-white text-purple-600 border-2 border-purple-100 px-8 py-3 rounded-md font-bold hover:bg-purple-50 transition-all">
              Login
            </Link>
          </div>
        </div>

        {/* Wavy Background Bottom */}
        <div className="absolute bottom-0 left-0 w-full leading-none">
          <svg className="w-full h-24 md:h-48" viewBox="0 0 1440 320" preserveAspectRatio="none">
             <path fill="#4ade80" fillOpacity="0.4" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
             <path fill="#8b5cf6" fillOpacity="0.6" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,122.7C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* What is HackOnX */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-pixel text-purple-700 mb-8 tracking-wide">WHAT'S HACKONX</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            HackOnX is a multi-state offline hackathon bringing together India's smartest student builders. Designed around High-Performance Computing, it challenges you to solve real-world problems at scale. Learn, build, and compete—city by city.
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-pixel text-purple-700 mb-4 tracking-wide">HIGHLIGHTS</h2>
            <div className="w-24 h-1 bg-green-400 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Clock size={32} />, title: "36-hour non-stop build marathon", color: "bg-red-100 text-red-600" },
              { icon: <MapPin size={32} />, title: "Happening across 5+ states", color: "bg-purple-100 text-purple-600" },
              { icon: <Users size={32} />, title: "Work with top industry mentors", color: "bg-amber-100 text-amber-600" },
              { icon: <Gift size={32} />, title: "Win cash prizes & national recognition", color: "bg-purple-100 text-purple-800" },
              { icon: <Lightbulb size={32} />, title: "Solve real-world problem statements", color: "bg-blue-100 text-blue-600" },
              { icon: <Globe size={32} />, title: "Showcase your work to recruiters", color: "bg-green-100 text-green-600" },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-6`}>
                  {item.icon}
                </div>
                <h3 className="font-medium text-gray-800">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section id="locations" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-pixel text-purple-700 mb-4 tracking-wide">LOCATIONS</h2>
            <p className="text-gray-600">Choose your city at registration</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { city: "Bengaluru", date: "17 / 03 / 2025", venue: "Social Indiranagar", img: "https://picsum.photos/400/200?random=1" },
              { city: "Chennai", date: "17 / 03 / 2025", venue: "Social Indiranagar", img: "https://picsum.photos/400/200?random=2" },
              { city: "Hyderabad", date: "17 / 03 / 2025", venue: "Social Indiranagar", img: "https://picsum.photos/400/200?random=3" },
              { city: "Goa", date: "17 / 03 / 2025", venue: "Social Indiranagar", img: "https://picsum.photos/400/200?random=4" },
              { city: "Pune", date: "17 / 03 / 2025", venue: "Social Indiranagar", img: "https://picsum.photos/400/200?random=5" },
              { city: "Delhi NCR", date: "17 / 03 / 2025", venue: "Social Indiranagar", img: "https://picsum.photos/400/200?random=6" },
            ].map((loc, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl overflow-hidden group hover:shadow-lg transition-all cursor-pointer border border-gray-100">
                <div className="h-32 overflow-hidden">
                    <img src={loc.img} alt={loc.city} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 text-purple-600">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{loc.city}</h3>
                    <p className="text-xs text-gray-500 mt-1">Date : {loc.date}</p>
                    <p className="text-xs text-gray-500">Venue: {loc.venue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Pool */}
      <section id="prizes" className="py-20 relative overflow-hidden bg-purple-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-900"></div>
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl font-pixel mb-8 tracking-widest text-white">PRIZE POOL</h2>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 mb-12">
            <h3 className="text-6xl font-pixel text-green-400 mb-6">₹XX,XX,XXX+</h3>
            <div className="space-y-4 text-lg">
              <p><strong className="text-purple-300">1st Prize:</strong> Cash + Laptop + Goodies + Fast-Track Internship</p>
              <p><strong className="text-purple-300">2nd Prize:</strong> Cash + Swag + Industry Vouchers</p>
              <p><strong className="text-purple-300">3rd Prize:</strong> Goodies + Tech Accessories + Recognition</p>
            </div>
          </div>
          
          <div className="bg-purple-800/50 rounded-xl p-6 inline-block">
             <h4 className="text-green-400 font-bold mb-2 uppercase tracking-wider">For Every Participant</h4>
             <ul className="text-sm space-y-2 flex flex-col md:flex-row gap-4 md:gap-8 justify-center">
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full"></div> Certificate of Participation</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full"></div> Access to mentors</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full"></div> Event Swags</li>
             </ul>
          </div>
        </div>
      </section>

      {/* Themes */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-pixel text-purple-700 mb-4 tracking-wide">THEMES</h2>
            <p className="text-gray-600">Build solutions across cutting-edge domains</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "High-Performance Computing", icon: <Cpu /> },
              { label: "AI / ML", icon: <Database /> },
              { label: "Developer Tools", icon: <Settings /> },
              { label: "Cloud & Distributed Systems", icon: <Globe /> },
              { label: "Cybersecurity", icon: <Shield /> },
              { label: "Sustainability", icon: <Leaf /> },
              { label: "Open Innovation", icon: <Lightbulb /> },
            ].map((theme, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center gap-4 group">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                  {theme.icon}
                </div>
                <span className="font-medium text-gray-800 text-sm">{theme.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-green-500 text-white relative overflow-hidden">
        {/* Wavy top divider inside section for visual break if needed, using standard border here for simplicity */}
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-pixel mb-4 tracking-wide text-gray-900">HOW IT WORKS</h2>
          </div>

          <div className="space-y-4">
             {[
                { step: "1", title: "Register your team", desc: "(Team of 4)" },
                { step: "2", title: "Select your city", desc: "Attend the offline edition near you." },
                { step: "3", title: "Build for 36 hours", desc: "Solve a real-world problem with your team." },
                { step: "4", title: "Demo to judges", desc: "Top teams from each city qualify for the grand stage." },
             ].map((item, idx) => (
                <div key={idx} className="bg-green-50/90 backdrop-blur-sm p-6 rounded-lg flex items-center gap-6">
                   <div className="text-4xl font-pixel text-purple-600 font-bold w-12">{item.step}</div>
                   <div>
                      <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <section className="py-20 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-gray-500 mb-6">Hurry! Only limited seats per city.</p>
            
            <div className="relative inline-block w-full max-w-lg mx-auto">
                <div className="absolute inset-0 bg-purple-400 blur-lg opacity-30 transform translate-y-2"></div>
                <div className="bg-purple-600 text-white rounded-xl p-8 shadow-2xl relative z-10 transform -rotate-1">
                    <h3 className="text-2xl font-bold mb-2">Registrations close in 8 days</h3>
                </div>
            </div>

            <div className="mt-12">
                <Link to="/signup" className="bg-purple-600 text-white px-12 py-4 rounded-md font-bold text-lg shadow-xl hover:bg-purple-700 transition-all">
                  Register Now
                </Link>
            </div>
        </div>
      </section>

       {/* Simple Footer */}
       <footer className="bg-purple-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
             <div className="mb-4 md:mb-0">
                 <h2 className="text-3xl font-pixel tracking-widest">HACKONX</h2>
                 <p className="text-purple-200 text-sm mt-2">support@hackonx.com</p>
             </div>
             <div className="flex gap-6 text-sm font-medium">
                <a href="#" className="hover:text-green-300">Home</a>
                <a href="#" className="hover:text-green-300">Register</a>
                <a href="#" className="hover:text-green-300">Rules</a>
                <a href="#" className="hover:text-green-300">Contact</a>
             </div>
          </div>
       </footer>
    </div>
  );
};

export default LandingPage;