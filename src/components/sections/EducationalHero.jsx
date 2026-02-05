

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Send } from 'lucide-react';
import CountUp from 'react-countup';

const EducationalHero = () => {
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

  return (
    <section id="hero" className="relative   flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/assets/basbg.jpg')",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
      </div>

      {/* Hero Content - two column layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-[20px] w-full">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
          {/* Left: Text content */}
          <div className="w-full lg:w-1/2 text-left mt-12 md:mt-10 lg:text-left">
            <div className="hidden sm:inline-block  mb-6 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
              <span className="text-yellow-500 text-sm font-semibold">Learn From Anywhere In The World</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-5xl sm:text-7xl md:text-6xl lg:text-7xl md:font-extrabold  leading-tight">
                Study <span className="text-[#FAD604]">Bitcoin.</span>
                <br/>
                Study Freedom!
              </h1>
              {/* <h1 className="text-5xl sm:text-7xl md:text-6xl lg:text-7xl md:font-extrabold mb-4 leading-tight">
                Study Freedom!
              </h1> */}
            </div>

            <p className="text-lg mt-5 md:text-xl text-gray-300 mb-8 max-w-2xl">
              Everything you need to start your Bitcoin journey. Guides, tools, and trusted resources to help you learn and grow.
            </p>

            <div className="flex sm:flex-row gap-3 mt-5 justify-start mb-6 w-full max-w-lg">
              <button
                onClick={() => scrollToSection('education-programs')}
                className="inline-flex w-full sm:w-auto items-center justify-center px-2 py-2 sm:py-2.5 bg-yellow-500 text-black font-bold text-sm sm:text-base hover:bg-yellow-400 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-yellow-500/50"
              >
                Explore Bitcoin Programs
                <ArrowRight className="ml-2" size={18} />
              </button>
              <button
                onClick={() => scrollToSection('bitcoin-resources')}
                className="inline-flex w-full sm:w-auto items-center justify-center px-4 py-2 sm:py-2.5 bg-transparent border-2 border-yellow-500 text-yellow-500 font-bold text-sm sm:text-base hover:bg-yellow-500 hover:text-black transition-all duration-200"
              >
                Explore Bitcoin Resources
              </button>
            </div>

          </div>

          {/* Right: Image collage */}
          <div className="w-full hidden lg:w-1/2 flex items-center justify-center">
            <div className="relative w-[460px] h-[300px] lg:w-[520px] lg:h-[360px]">
              {/* Large top-right image */}
              <div className="absolute right-0 top-0 w-[320px] h-[240px] lg:w-[360px] lg:h-[270px] rounded-2xl overflow-hidden border border-gray-800 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop"
                  alt="Team collaborating"
                  className="w-full h-full object-cover grayscale-[10%]"
                />
              </div>

              {/* Large bottom-left image */}
              <div className="absolute left-0 bottom-[-70px] w-[300px] h-[260px] lg:w-[340px] lg:h-[300px] rounded-2xl overflow-hidden border border-gray-800 shadow-xl transform -translate-y-6 lg:-translate-y-8">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop"
                  alt="Student learning"
                  className="w-full h-full object-cover grayscale-[10%]"
                />
              </div>

              {/* Small middle accent */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[212px] h-[212px] lg:w-[232px] lg:h-[232px] rounded-xl overflow-hidden border-2 border-yellow-500 shadow-md bg-gradient-to-tr from-yellow-500/10 to-transparent flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop"
                  alt="Study group"
                  className="w-full h-full object-cover rounded-lg filter grayscale-[10%]"
                />
              </div>

              {/* Decorative small circle */}
              <div className="absolute -left-6 -top-6 w-6 h-6 rounded-full bg-yellow-500/80 blur-sm" aria-hidden="true" />
            </div>
          </div>
        </div>
        {/* <div className="grid grid-cols-2 max-sm:hidden sm:grid-cols-4 gap-6 mt-6 max-w-md mx-auto lg:mx-0">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-1"><CountUp end={2} suffix="+" enableScrollSpy /></div>
            <div className="text-gray-400 text-sm">Years Teaching</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-1"><CountUp end={500} suffix="+" enableScrollSpy /></div>
            <div className="text-gray-400 text-sm">Students Reached</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-1"><CountUp end={50} suffix="+" enableScrollSpy /></div>
            <div className="text-gray-400 text-sm">Communities</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-1"><CountUp end={100} suffix="%" enableScrollSpy /></div>
            <div className="text-gray-400 text-sm">Free Education</div>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default EducationalHero;






