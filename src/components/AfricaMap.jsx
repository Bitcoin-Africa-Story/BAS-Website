import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const cities = [
    { name: 'Lagos', x: 42, y: 52, events: 12 },
    { name: 'Nairobi', x: 68, y: 58, events: 8 },
    { name: 'Cape Town', x: 50, y: 88, events: 15 },
    { name: 'Accra', x: 38, y: 54, events: 5 },
    { name: 'Kigali', x: 60, y: 62, events: 4 },
    { name: 'Cairo', x: 62, y: 20, events: 9 },
    { name: 'Johannesburg', x: 55, y: 82, events: 7 },
    { name: 'Dakar', x: 18, y: 45, events: 3 }
];

const AfricaMap = ({ onCityClick }) => {
    const [hoveredCity, setHoveredCity] = useState(null);

    return (
        <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
            {/* Abstract Map Container */}
            <div className="relative w-full max-w-[500px] aspect-[0.9]">
                {/* SVG Map of Africa */}
                <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full drop-shadow-2xl filter"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(234, 179, 8, 0.1))' }}
                >
                    {/* Subtle Grid Background inside SVG */}
                    <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                        </pattern>
                    </defs>

                    <path
                        d="M52.5,13.5 C59.5,13.5 68.5,19.5 73.5,23.5 C77.5,26.5 82.5,28.5 84.5,35.5 C85.5,39.5 88.5,45.5 88.5,50.5 C88.5,60.5 75.5,75.5 65.5,88.5 C60.5,94.5 55.5,95.5 50.5,95.5 C43.5,95.5 45.5,85.5 40.5,80.5 C35.5,75.5 30.5,70.5 28.5,65.5 C26.5,60.5 15.5,55.5 13.5,50.5 C11.5,45.5 13.5,35.5 18.5,30.5 C20.5,28.5 25.5,30.5 28.5,28.5 C31.5,26.5 30.5,20.5 35.5,15.5 C40.5,10.5 45.5,13.5 52.5,13.5 Z"
                        fill="rgba(30, 41, 59, 0.5)"
                        stroke="rgba(234, 179, 8, 0.2)"
                        strokeWidth="0.5"
                        className="transition-colors duration-500 hover:fill-gray-800/80"
                    />

                    {/* Grid Overlay on Map Shape */}
                    <path
                        d="M52.5,13.5 C59.5,13.5 68.5,19.5 73.5,23.5 C77.5,26.5 82.5,28.5 84.5,35.5 C85.5,39.5 88.5,45.5 88.5,50.5 C88.5,60.5 75.5,75.5 65.5,88.5 C60.5,94.5 55.5,95.5 50.5,95.5 C43.5,95.5 45.5,85.5 40.5,80.5 C35.5,75.5 30.5,70.5 28.5,65.5 C26.5,60.5 15.5,55.5 13.5,50.5 C11.5,45.5 13.5,35.5 18.5,30.5 C20.5,28.5 25.5,30.5 28.5,28.5 C31.5,26.5 30.5,20.5 35.5,15.5 C40.5,10.5 45.5,13.5 52.5,13.5 Z"
                        fill="url(#grid)"
                        className="pointer-events-none opacity-50"
                    />

                    {/* City Dots */}
                    {cities.map((city) => (
                        <g
                            key={city.name}
                            onClick={() => onCityClick && onCityClick(city)}
                            className="cursor-pointer group"
                            onMouseEnter={() => setHoveredCity(city)}
                            onMouseLeave={() => setHoveredCity(null)}
                        >
                            {/* Pulse Effect */}
                            <circle cx={city.x} cy={city.y} r="1.5" fill="#ca8a04">
                                <animate
                                    attributeName="r"
                                    values="1.5;3;1.5"
                                    dur="3s"
                                    repeatCount="indefinite"
                                    begin={`${Math.random() * 2}s`}
                                />
                                <animate
                                    attributeName="opacity"
                                    values="0.5;0.2;0.5"
                                    dur="3s"
                                    repeatCount="indefinite"
                                    begin={`${Math.random() * 2}s`}
                                />
                            </circle>

                            {/* Main Dot */}
                            <circle
                                cx={city.x}
                                cy={city.y}
                                r="1"
                                fill="#FAD604"
                                className="transition-all duration-300 group-hover:r-1.5 shadow-[0_0_10px_#FAD604]"
                            />

                            {/* Connecting Lines (Decorational) */}
                            <path
                                d={`M${city.x},${city.y} L${50},${50}`}
                                stroke="url(#gradient)"
                                strokeWidth="0.1"
                                opacity="0"
                                className="group-hover:opacity-30 transition-opacity duration-300"
                            />
                        </g>
                    ))}

                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FAD604" stopOpacity="0" />
                            <stop offset="100%" stopColor="#FAD604" stopOpacity="0.5" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Hover Tooltips (HTML Overlay) */}
                <AnimatePresence>
                    {hoveredCity && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="absolute z-20 pointer-events-none"
                            style={{
                                left: `${hoveredCity.x}%`,
                                top: `${hoveredCity.y}%`,
                                transform: 'translate(-50%, -150%)'
                            }}
                        >
                            <div className="bg-black/90 border border-yellow-500/30 backdrop-blur-md rounded-lg px-3 py-2 -mt-12 shadow-xl min-w-[120px]">
                                <div className="text-yellow-500 font-bold text-sm">{hoveredCity.name}</div>
                                <div className="text-gray-400 text-xs">{hoveredCity.events} Upcoming Events</div>
                                {/* Arrow */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/90"></div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AfricaMap;
