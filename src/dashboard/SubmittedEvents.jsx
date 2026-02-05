import { useState, useEffect } from 'react';
import { Eye, Check, Edit, Trash2, Calendar, MapPin, Clock, X as CloseIcon } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';

const SubmittedEvents = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewEvent, setPreviewEvent] = useState(null);
    const [modal, setModal] = useState({ open: false, title: '', message: '', confirmAction: null });

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const snap = await getDocs(collection(db, 'submittedEvents'));
            const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setSubmissions(items);
        } catch (err) {
            console.error('Error fetching submissions:', err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (title, message, confirmAction = null) => {
        setModal({ open: true, title, message, confirmAction });
    };

    const closeModal = () => setModal({ open: false, title: '', message: '', confirmAction: null });

    const handleAccept = async (submission) => {
        openModal('Accept Event', 'Are you sure you want to publish this event?', async () => {
            try {
                // Add to events collection
                const payload = {
                    eventName: submission.eventName,
                    venue: submission.venue,
                    address: submission.address,
                    date: submission.date,
                    time: submission.time,
                    description: submission.description,
                    banner: submission.banner,
                    registrationUrl: submission.registrationUrl || '',
                    createdAt: serverTimestamp()
                };

                await addDoc(collection(db, 'events'), payload);

                // Delete from submitted events
                await deleteDoc(doc(db, 'submittedEvents', submission.id));

                setSubmissions(prev => prev.filter(s => s.id !== submission.id));
                closeModal();
                toast.success('Event has been published successfully!');
            } catch (err) {
                console.error('Error accepting submission:', err);
                toast.error('Failed to publish event. Please try again.');
            }
        });
    };

    const handleDelete = (submission) => {
        openModal('Delete Submission', 'Are you sure you want to delete this submission?', async () => {
            try {
                await deleteDoc(doc(db, 'submittedEvents', submission.id));
                setSubmissions(prev => prev.filter(s => s.id !== submission.id));
                closeModal();
            } catch (err) {
                console.error('Error deleting submission:', err);
                toast.error('Failed to delete submission.');
            }
        });
    };

    return (
        <div className="pb-20">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-black mb-2 tracking-tight">
                    Submitted <span className="text-yellow-500">Events</span>
                </h1>
                <p className="text-sm text-gray-400">Review and manage community event submissions</p>
            </div>

            {/* Submissions Grid */}
            {loading ? (
                <div className="py-20 text-center bg-[#0A0A0A] border border-white/5 rounded-3xl">
                    <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading submissions...</p>
                </div>
            ) : submissions.length === 0 ? (
                <div className="py-20 text-center bg-[#0A0A0A] border border-white/5 rounded-3xl">
                    <Calendar className="mx-auto text-gray-700 mb-4" size={48} />
                    <p className="text-gray-400 font-medium">No pending submissions</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {submissions.map(submission => (
                        <div
                            key={submission.id}
                            className="group bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden hover:border-yellow-500/50 transition-all duration-300"
                        >
                            {/* Banner */}
                            <div className="h-40 bg-gray-800 relative overflow-hidden">
                                {submission.banner ? (
                                    <img
                                        src={submission.banner}
                                        alt={submission.eventName}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Calendar size={40} className="text-gray-700" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded-md shadow-lg">
                                    {submission.date}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-500 transition-all line-clamp-1">
                                    {submission.eventName}
                                </h3>

                                <div className="space-y-2 text-xs text-gray-500 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} className="text-yellow-500" />
                                        <span>{submission.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={12} className="text-yellow-500" />
                                        <span className="line-clamp-1">{submission.venue}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => setPreviewEvent(submission)}
                                        className="flex items-center justify-center gap-1 px-3 py-2 bg-white/5 text-gray-300 border border-white/5 rounded-lg hover:bg-blue-500 hover:text-white hover:border-transparent transition-all text-[10px] font-bold"
                                        title="Preview"
                                    >
                                        <Eye size={14} />
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleAccept(submission)}
                                        className="flex items-center justify-center gap-1 px-3 py-2 bg-white/5 text-gray-300 border border-white/5 rounded-lg hover:bg-green-500 hover:text-white hover:border-transparent transition-all text-[10px] font-bold"
                                        title="Accept"
                                    >
                                        <Check size={14} />
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleDelete(submission)}
                                        className="flex items-center justify-center gap-1 px-3 py-2 bg-red-500/5 text-red-500 border border-red-500/10 rounded-lg hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {previewEvent && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                    <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-[#0A0A0A] border-b border-white/10 p-6 flex items-center justify-between z-10">
                            <h2 className="text-2xl font-bold text-white">Event Preview</h2>
                            <button
                                onClick={() => setPreviewEvent(null)}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                            >
                                <CloseIcon size={24} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Banner */}
                            {previewEvent.banner && (
                                <div className="rounded-xl overflow-hidden border border-white/10 h-48">
                                    <img
                                        src={previewEvent.banner}
                                        alt={previewEvent.eventName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Details */}
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-4">{previewEvent.eventName}</h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-start gap-3">
                                        <Calendar size={18} className="text-yellow-500 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-400">Date</p>
                                            <p className="text-white font-medium">{previewEvent.date}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Clock size={18} className="text-yellow-500 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-400">Time</p>
                                            <p className="text-white font-medium">{previewEvent.time}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <MapPin size={18} className="text-yellow-500 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-400">Venue</p>
                                            <p className="text-white font-medium">{previewEvent.venue}</p>
                                            <p className="text-gray-500 text-sm">{previewEvent.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-sm text-gray-400 mb-2">Description</p>
                                    <p className="text-white leading-relaxed">{previewEvent.description}</p>
                                </div>

                                {previewEvent.registrationUrl && (
                                    <div className="pt-4 border-t border-white/10">
                                        <p className="text-sm text-gray-400 mb-2">Registration Link</p>
                                        <a
                                            href={previewEvent.registrationUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-yellow-500 hover:underline text-sm break-all"
                                        >
                                            {previewEvent.registrationUrl}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setPreviewEvent(null);
                                        handleAccept(previewEvent);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-400 transition-all"
                                >
                                    <Check size={18} />
                                    Accept & Publish
                                </button>
                                <button
                                    onClick={() => setPreviewEvent(null)}
                                    className="px-6 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {modal.open && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={closeModal}></div>
                    <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl p-10 w-full max-w-md shadow-2xl text-center">
                        <h3 className="text-2xl font-black mb-3 text-yellow-500">{modal.title}</h3>
                        <p className="text-gray-400 mb-8 leading-relaxed">{modal.message}</p>
                        <div className="flex gap-4">
                            {modal.confirmAction ? (
                                <>
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        onClick={modal.confirmAction}
                                        className="flex-1 px-4 py-4 bg-yellow-500 text-black rounded-2xl font-bold"
                                    >
                                        CONFIRM
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={closeModal}
                                    className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-black text-lg hover:bg-yellow-400"
                                >
                                    CONTINUE
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubmittedEvents;
