import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Clock } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const BitcoinPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'education_programs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const programsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPrograms(programsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (!current) return;
    const scrollAmount = 340;
    if (direction === 'left') {
      current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-black text-white px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading programs...</p>
        </div>
      </section>
    );
  }

  if (programs.length === 0) return null;

  return (
    <section id="education-programs" className="py-20 bg-black text-white px-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-12">
          <span className="inline-block px-4 py-1.5 rounded-lg bg-yellow-500 text-black text-xs font-bold uppercase tracking-widest mb-6">
            Bitcoin Education Programs
          </span>
          <h2 className="text-5xl font-bold mb-4">
            New to <span className="text-yellow-500">Bitcoin?</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl">
            Explore our Bitcoin Educational Program to learn more and get more insight on Bitcoin.
          </p>
        </div>

        <div className="relative group">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-10"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {programs.map((course) => {
              const CardWrapper = course.link ? 'a' : 'div';
              const extraProps = course.link ? { href: course.link, target: "_blank", rel: "noopener noreferrer" } : {};

              return (
                <CardWrapper
                  key={course.id}
                  {...extraProps}
                  className="min-w-[320px] md:min-w-[320px] snap-start group/card cursor-pointer"
                >
                  <div className="relative h-[450px] overflow-hidden border border-white/10 hover:border-yellow-500/50 transition-all duration-500 bg-[#111]">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover opacity-50 group-hover/card:scale-110 group-hover/card:opacity-70 transition-all duration-700"
                    />

                    <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent">
                      <div className="flex gap-2 mb-4">
                        <span className="px-3 py-1 bg-yellow-500 text-black text-[10px] font-bold rounded">
                          {course.level} | {course.price}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold mb-3 group-hover/card:text-yellow-500 transition-colors uppercase tracking-tight">
                        {course.title}
                      </h3>

                      <p className="text-gray-300 text-sm mb-6 line-clamp-2">
                        {course.desc}
                      </p>

                      <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="w-4 h-4 text-yellow-500" />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <BookOpen className="w-4 h-4 text-yellow-500" />
                          Online
                        </div>
                      </div>
                    </div>
                  </div>
                </CardWrapper>
              );
            })}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BitcoinPrograms;