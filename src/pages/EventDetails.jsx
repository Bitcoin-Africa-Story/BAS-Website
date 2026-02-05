import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock, Share2 } from 'lucide-react';
import { eventsService } from '../services/eventsService';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                const data = await eventsService.getEventById(id);
                if (data) {
                    setEvent(data);
                } else {
                    setError('Event not found');
                }
            } catch (err) {
                console.error('Error fetching event details:', err);
                setError('Failed to load event details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEvent();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white pt-24 px-6 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-black text-white pt-24 px-6 flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Oops!</h2>
                <p className="text-gray-400 mb-6">{error || 'Event not found'}</p>
                <button
                    onClick={() => navigate('/events')}
                    className="px-6 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition-colors"
                >
                    Back to Events
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20">
            {/* Hero / Banner Section */}
            <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
                {event.banner ? (
                    <>
                        <img
                            src={event.banner}
                            alt={event.eventName}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    </>
                ) : (
                    <div className="w-full h-full bg-gray-900 border-b border-gray-800 flex items-center justify-center">
                        <span className="text-gray-600 italic">No Banner Image</span>
                    </div>
                )}

                <div className="absolute top-6 left-6 z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-all border border-gray-700"
                    >
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-10">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-10 shadow-2xl">
                    <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
                        <div className="flex-1">
                            {/* Tags/Category */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-wider rounded-full">
                                    {event.format === 'virtual' ? 'Virtual Event' : 'In-Person Event'}
                                </span>
                                {event.city && (
                                    <span className="px-3 py-1 bg-gray-800 text-gray-400 text-xs font-bold uppercase tracking-wider rounded-full">
                                        {event.city}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                {event.eventName}
                            </h1>

                            {/* Event Meta Data */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300 mb-8">
                                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-gray-800">
                                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-semibold">Date</div>
                                        <div>{event.date}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-gray-800">
                                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-semibold">Time</div>
                                        <div>{event.time || 'TBA'}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-gray-800 sm:col-span-2">
                                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-semibold">Location</div>
                                        <div>{event.venue || event.location || 'Online'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Card (Sidebar on desktop) */}
                        <div className="w-full md:w-80 shrink-0 space-y-4">
                            <div className="p-6 bg-black/50 border border-gray-800 rounded-xl">
                                <h3 className="text-lg font-bold text-white mb-4">Organized by</h3>
                                <p className="text-yellow-500 font-medium text-lg mb-6">{event.organiser || 'Bitcoin Africa Community'}</p>

                                {event.registrationUrl ? (
                                    <a
                                        href={event.registrationUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-center rounded-lg transition-colors shadow-lg shadow-yellow-500/20"
                                    >
                                        REGISTER NOW
                                    </a>
                                ) : (
                                    <button disabled className="block w-full py-4 bg-gray-800 text-gray-500 font-bold text-center rounded-lg cursor-not-allowed">
                                        Registration Closed
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="mt-12 pt-10 border-t border-gray-800">
                        <h3 className="text-2xl font-bold text-white mb-6">About this Event</h3>
                        <div className="prose prose-invert prose-lg max-w-none text-gray-400">
                            <p className="whitespace-pre-wrap leading-relaxed">
                                {event.description || event.details || 'No description provided for this event.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
