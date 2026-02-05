import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Twitter, Quote } from 'lucide-react';

const TestimonialCarousel = ({ testimonials = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const prevTestimonial = () => {
    setCurrentIndex((i) => (testimonials && testimonials.length ? (i - 1 + testimonials.length) % testimonials.length : 0));
  };
  const nextTestimonial = () => {
    setCurrentIndex((i) => (testimonials && testimonials.length ? (i + 1) % testimonials.length : 0));
  };

  useEffect(() => {
    if (!testimonials || testimonials.length === 0) return;
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, testimonials]);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <div
      className="relative max-w-5xl mx-auto px-4 py-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={(e) => { if (e.key === 'ArrowLeft') prevTestimonial(); if (e.key === 'ArrowRight') nextTestimonial(); }}
      tabIndex={0}
    >
      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial, i) => (
            <div key={testimonial.id} className="w-full flex-shrink-0 px-4 flex justify-center">
              {/* Fixed Width Card - Matching Education Testimonials */}
              <div className={`relative p-8 rounded-3xl border transition-all duration-500 w-full max-w-lg bg-[#111111] ${i === currentIndex ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'border-white/5 opacity-40 scale-95'
                }`}>
                {/* Background Quote Icon */}
                <Quote className="absolute top-8 right-8 w-10 h-10 text-yellow-500/10" strokeWidth={3} />

                <a
                  href={testimonial.twitterLink || '#'}
                  target={testimonial.twitterLink ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className={`block ${testimonial.twitterLink ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {/* User Info */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex-shrink-0 flex items-center justify-center text-black font-extrabold text-xl shadow-lg overflow-hidden">
                      {testimonial.image ? (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        testimonial.avatar || (testimonial.name ? testimonial.name[0] : 'U')
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg leading-none text-white">{testimonial.name || 'Anonymous'}</h4>
                      <p className="text-[10px] text-yellow-500 font-bold mt-1 tracking-widest">{testimonial.role || testimonial.location || 'Movement Member'}</p>
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-gray-400 text-lg leading-relaxed italic mb-6">
                    "{testimonial.text || 'Success Story on X'}"
                  </p>

                  {/* X Link Badge */}
                  {testimonial.twitterLink && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-yellow-500 text-xs font-bold uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all duration-300">
                      <Twitter size={14} />
                      Verify on X
                    </div>
                  )}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls - Matching Education Style */}
      <div className="flex flex-col items-center mt-12 gap-6">
        {/* Pagination Dots */}
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-10 bg-yellow-500' : 'w-2 bg-white/20'}`}
            />
          ))}
        </div>

        {/* Arrow Buttons */}
        <div className="flex gap-4">
          <button
            onClick={prevTestimonial}
            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all group"
            aria-label="Previous testimonial"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-active:scale-90" />
          </button>
          <button
            onClick={nextTestimonial}
            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all group"
            aria-label="Next testimonial"
          >
            <ArrowRight className="w-5 h-5 transition-transform group-active:scale-90" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
