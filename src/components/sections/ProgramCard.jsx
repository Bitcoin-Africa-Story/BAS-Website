import React from 'react';
import { ArrowRight, Users, GraduationCap, Briefcase, Globe, Zap, User } from 'lucide-react';
import CountUp from 'react-countup';
import { Link } from 'react-router-dom';

const ProgramCard = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Offset for fixed header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const stats = [
    { label: 'Registrations', value: 250, suffix: '+', icon: <Users className="w-4 h-4" /> },
    { label: 'Alumni', value: 100, suffix: '+', icon: <GraduationCap className="w-4 h-4" /> },
    { label: 'Careers', value: 15, suffix: '+', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Countries', value: 10, suffix: '+', icon: <Globe className="w-4 h-4" /> },
    { label: 'Sats Rewarded', value: 150, suffix: 'K', icon: <Zap className="w-4 h-4" /> },
    { label: 'Educators', value: 30, suffix: '+', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <section className="relative w-full py-20 bg-[#0A0A0A] text-white overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Image Side with modern framing */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-600  blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative sm:h-[350px] md:h-[500px]  overflow-hidden border border-white/10">
              <img
                src="/assets/basplaceholder.png"
                alt="Bitcoin Educator"
                className="w-full h-full  grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                <p className="text-yellow-500 font-medium tracking-widest uppercase text-xs">Community Led</p>
                <h3 className="text-xl font-semibold">Empowering the next generation</h3>
              </div>
            </div>
          </div>

          {/* Right: Content Side */}
          <div className="flex flex-col space-y-8">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse mr-2"></span>
                It Costs $0 To Study Bitcoin
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Begin Your Bitcoin <br />
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Journey With Us
                </span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                Master the fundamentals of sound money. Our free educational programs are designed
                to guide you through decentralization, cryptography, and the future of global finance.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => scrollToSection('education-programs')}
                className="group relative px-8 py-4 bg-yellow-500 text-black font-bold  flex items-center gap-2 hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)]"
              >
                Join Next Diploma
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link to="/events" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold  hover:bg-white/10 transition-all backdrop-blur-sm">
                View Meetups
              </Link>
            </div>

            {/* Redesigned Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-10 border-t border-white/10">
              {stats.map((stat, index) => (
                <div key={index} className="group">
                  <div className="flex items-center gap-2 text-gray-500 mb-1 group-hover:text-yellow-500 transition-colors">
                    {stat.icon}
                    <span className="text-[10px] uppercase tracking-widest font-bold">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight">
                    <CountUp end={stat.value} suffix={stat.suffix} enableScrollSpy />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProgramCard;