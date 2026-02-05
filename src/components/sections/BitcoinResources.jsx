import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function BitcoinResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'bitcoin_resources'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const resourcesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setResources(resourcesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading || resources.length === 0) return null;

  return (
    <section id="bitcoin-resources" className="bg-black text-white py-16">
      <div className="container mx-auto px-6">

        <div className="mb-6">
          <div className="inline-block bg-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-sm">BITCOIN RESOURCES</div>
        </div>

        <div className="mb-6 max-w-3xl text-gray-300 text-sm">
          <p>
            A curated selection of Bitcoin resources — whitepapers, tools, maps and community projects to help you explore further.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((r) => {
            const CardWrapper = r.link ? 'a' : 'article';
            const extraProps = r.link ? { href: r.link, target: "_blank", rel: "noopener noreferrer" } : {};

            return (
              <CardWrapper
                key={r.id}
                {...extraProps}
                className="group relative flex flex-col bg-[#0A0A0A] border border-white/5 hover:border-yellow-500/50 transition-all duration-500 min-h-[400px] cursor-pointer"
              >
                <div className="relative h-[200px] overflow-hidden bg-yellow-100/5">
                  {r.imageSrc ? (
                    <img
                      src={r.imageSrc}
                      alt={r.imageAlt || r.title}
                      className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-yellow-900/20">
                      <span className="text-xs font-bold text-center text-yellow-500">{r.title.toUpperCase()}</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h4 className="text-lg font-bold mb-2 line-clamp-2 leading-tight group-hover:text-yellow-500 transition-colors uppercase text-white tracking-tight">
                    {r.title}
                  </h4>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {r.subtitle}
                  </p>

                  <div className="mt-auto pt-4 border-t border-white/5">
                    <button className="flex items-center gap-2 text-[10px] font-black text-yellow-500 hover:text-white transition-colors group/btn uppercase tracking-widest">
                      ACCESS RESOURCE
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
}
