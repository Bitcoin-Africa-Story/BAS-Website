import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ArrowUpRight } from 'lucide-react';

const OtherBitcoinPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'other_programs'), orderBy('createdAt', 'desc'));
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

  if (loading || programs.length === 0) return null;

  return (
    <section className="py-24 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header Section */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-yellow-500 text-black text-[10px] font-bold uppercase tracking-widest mb-6">
            OTHER BITCOIN EDUCATION PROGRAMS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Other Bitcoin <span className="text-yellow-500">Programs</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl">
            Explore more Bitcoin Educational Program across and beyond Africa.
          </p>
        </div>

        {/* 4-Column Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((program) => {
            const CardWrapper = program.link ? 'a' : 'div';
            const extraProps = program.link ? { href: program.link, target: "_blank", rel: "noopener noreferrer" } : {};

            return (
              <CardWrapper
                key={program.id}
                {...extraProps}
                className="group relative flex flex-col bg-[#0A0A0A] overflow-hidden border border-white/5 hover:border-yellow-500/50 transition-all duration-500 min-h-[420px] cursor-pointer"
              >
                {/* Card Image Container - Increased height to match standard */}
                <div className="relative h-[240px] overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80"
                  />

                  {/* Level Badge Overlay (Exactly like the screenshots) */}
                  <div className="absolute bottom-0 left-0">
                    <span className={`inline-block px-3 py-1 text-[10px] font-bold ${program.level === 'EXPERT' ? 'bg-black text-white border-t border-r border-white/20' : 'bg-yellow-500 text-black'
                      }`}>
                      {program.level} | {program.price}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold mb-3 line-clamp-2 leading-tight group-hover:text-yellow-500 transition-colors uppercase tracking-tight">
                    {program.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {program.desc}
                  </p>

                  {/* Spacer to push button to bottom */}
                  <div className="mt-auto pt-4 border-t border-white/5">
                    <button className="flex items-center gap-2 text-[10px] font-black text-yellow-500 hover:text-white transition-colors group/btn uppercase tracking-widest">
                      VIEW DETAILS
                      <ArrowUpRight className="w-3 h-3 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </CardWrapper>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default OtherBitcoinPrograms;
