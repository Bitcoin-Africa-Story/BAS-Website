import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Calendar, Clock, MapPin, Box, Ticket, X as CloseIcon, Save } from 'lucide-react';
import ScrollToTop from '../components/ScrollToTop';
import CountUp from '../components/ui/CountUp';
import { eventsService } from '../services/eventsService';
import { toast } from 'sonner';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const UpcomingEvent = ({ title, location, date, banner }) => (
  <div className="mb-6 bg-gray-900 border border-gray-800 hover:border-yellow-500 transition-all duration-300 group overflow-hidden">
    {banner && (
      <div className="h-48 overflow-hidden relative">
        <img
          src={banner}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
      </div>
    )}
    <div className="p-6">
      <div className="inline-block bg-yellow-500 text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4">Upcoming Event</div>
      <h4 className="text-xl font-bold text-gray-100 group-hover:text-yellow-500 transition-colors mb-3 line-clamp-2 italic">{title}</h4>

      <div className="space-y-2 mt-4 pt-4 border-t border-gray-800/50">
        <div className="text-sm text-gray-400 flex items-center gap-3">
          <span className="w-5 h-5 flex items-center justify-center bg-yellow-500/10 text-yellow-500 rounded text-xs">📍</span>
          <span className="line-clamp-1">{location}</span>
        </div>
        <div className="text-sm text-gray-400 flex items-center gap-3">
          <span className="w-5 h-5 flex items-center justify-center bg-yellow-500/10 text-yellow-500 rounded text-xs">📅</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  </div>
);

const Community = () => {
  const [events, setEvents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitFormData, setSubmitFormData] = useState({
    eventName: '',
    venue: '',
    address: '',
    date: '',
    time: '',
    description: '',
    banner: '',
    registrationUrl: '',
  });
  const [imageMode, setImageMode] = useState('url');
  const [imagePreview, setImagePreview] = useState('');

  React.useEffect(() => {
    const fetch = async () => {
      try {
        const all = await eventsService.getAllEvents();
        setEvents(all || []);
      } catch (err) {
        console.error('Error loading events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = React.useMemo(() => {
    if (!search) return events;
    const s = search.trim().toLowerCase();
    return events.filter(e => {
      return (
        (e.eventName && e.eventName.toLowerCase().includes(s)) ||
        (e.organiser && e.organiser.toLowerCase().includes(s)) ||
        (e.tags && e.tags.join(' ').toLowerCase().includes(s)) ||
        (e.city && e.city.toLowerCase().includes(s))
      );
    });
  }, [events, search]);

  const navigate = useNavigate();

  const compressImage = (file, maxWidth = 1200) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      setSubmitting(true);
      const compressedBlob = await compressImage(file);
      setSubmitFormData(prev => ({ ...prev, banner: compressedBlob }));
      setImagePreview(URL.createObjectURL(compressedBlob));
    } catch (err) {
      console.error('Image compression error', err);
      toast.error('Failed to process image');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let bannerUrl = submitFormData.banner;
      if (bannerUrl instanceof Blob) {
        const storageRef = ref(storage, `submittedEvents/banner_${Date.now()}`);
        await uploadBytes(storageRef, bannerUrl);
        bannerUrl = await getDownloadURL(storageRef);
      }

      const payload = {
        eventName: submitFormData.eventName,
        venue: submitFormData.venue,
        address: submitFormData.address,
        date: submitFormData.date,
        time: submitFormData.time,
        description: submitFormData.description,
        banner: bannerUrl || '',
        registrationUrl: submitFormData.registrationUrl || '',
        submittedAt: serverTimestamp(),
        status: 'pending'
      };

      await addDoc(collection(db, 'submittedEvents'), payload);

      // Reset form
      setSubmitFormData({
        eventName: '',
        venue: '',
        address: '',
        date: '',
        time: '',
        description: '',
        banner: '',
        registrationUrl: '',
      });
      setImagePreview('');
      setShowSubmitModal(false);
      toast.success('Event submitted successfully! Our team will review it shortly.');
    } catch (err) {
      console.error('Error submitting event:', err);
      toast.error('Failed to submit event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-[75px] pb-32">
      <section id="hero" className="relative flex items-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/assets/story.jpg')",
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
            <div className="w-full lg:w-1/2 text-left mt-12 md:mt-10 lg:text-left">
              <div className="hidden sm:inline-block mb-6 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                <span className="text-yellow-500 text-sm font-semibold">Your Network is your Networth</span>
              </div>

              <h1 className="text-5xl sm:text-7xl md:text-6xl lg:text-7xl md:font-extrabold mb-4 leading-tight">
                <span>Explore </span> <br className="" /> <span>Bitcoin </span> <br className="sm:hidden" /> <span>Events </span> <br className="" /> <span className="text-[#FAD604]">Across Africa</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
                Discover meetups, conferences, workshops, and grassroots Bitcoin gatherings shaping Africa’s Bitcoin circular economy.
              </p>

              {/* <div className="mt-4 flex gap-3">
                <button onClick={() => { const el = document.getElementById('events'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="px-5 py-2 sm:py-3 bg-yellow-500 rounded font-bold">🔍 Explore Events</button>
                <Link to="/dashboard/upload-event" className="px-5 py-2 sm:py-3 border border-yellow-500 text-yellow-500 rounded">➕ Submit an Event</Link>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      <div id="events" className="max-w-7xl mx-auto px-6 mt-16">
        {/* Search Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="relative flex-1 max-w-2xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={20} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by event, organiser, city or tag..."
              className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-800  text-gray-200 focus:outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder:text-gray-600"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <span className="text-yellow-500 font-black text-lg">{loading ? '...' : filtered.length}</span>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Events Found</span>
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-gray-900/50 border border-gray-800 rounded-3xl">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-6" />
            <p className="text-gray-400 font-medium animate-pulse tracking-wide">Synchronizing Bitcoin Events...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center bg-gray-900/50 border border-gray-800">
            <Box className="mx-auto text-gray-700 mb-4" size={48} />
            <p className="text-xl text-gray-400 font-medium">No events found matching your search</p>
            <button onClick={() => setSearch('')} className="mt-4 text-yellow-500 hover:text-yellow-400 font-bold transition-colors">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(e => (
              <div
                key={e.id}
                role="button"
                tabIndex={0}
                onKeyDown={(ev) => { if (ev.key === 'Enter') { if (e.registrationUrl) window.open(e.registrationUrl, '_blank'); else navigate(`/events/${e.id}`); } }}
                onClick={() => { if (e.registrationUrl) window.open(e.registrationUrl, '_blank'); else navigate(`/events/${e.id}`); }}
                className="group cursor-pointer bg-gray-900 border border-gray-800 hover:border-yellow-500/50 transition-all duration-300  overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/5"
              >
                {/* Banner wrapper */}
                <div className="relative h-48 overflow-hidden">
                  {e.banner ? (
                    <img
                      src={e.banner}
                      alt={e.eventName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Ticket size={40} className="text-gray-700" />
                    </div>
                  )}
                  {/* Category/Format Badge */}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                    <span className="text-[10px] font-black uppercase text-yellow-500 tracking-tighter">
                      {e.format === 'virtual' ? 'Online Event' : 'In-Person'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Meta data row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar size={14} className="text-yellow-500/70" />
                      <span>{e.date}</span>
                    </div>
                    {e.time && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 border-l border-gray-800 pl-4">
                        <Clock size={14} className="text-yellow-500/70" />
                        <span>{e.time}</span>
                      </div>
                    )}
                  </div>

                  <h4 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors line-clamp-2 min-h-[56px] leading-snug">
                    {e.eventName}
                  </h4>

                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                    <MapPin size={16} className="text-yellow-500/70 flex-shrink-0" />
                    <span className="line-clamp-1">{e.city ? `${e.city}, ` : ''}{e.venue || (e.format === 'virtual' ? 'Gathering Online' : '')}</span>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-widest group-hover:text-white transition-colors">Details</span>
                    {e.registrationUrl ? (
                      <button
                        onClick={(ev) => { ev.stopPropagation(); window.open(e.registrationUrl, '_blank'); }}
                        className="px-6 py-2 bg-yellow-500 text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/10"
                      >
                        Register
                      </button>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-all">
                        <ArrowRight size={16} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto mt-12 px-6">
        <div className="bg-gray-900 border border-gray-800 overflow-hidden shadow-2xl ">
          {/* Join Conversation Section */}
          <div className="p-6 md:p-8 text-center border-b border-gray-800/50">
            <div className="hidden sm:inline-block mb-3 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
              <span className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest">Connect With Us</span>
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Hosting a Bitcoin event in Africa?</h4>
            <p className="text-gray-400 max-w-xl mx-auto mb-6 text-sm">
              Add your event to our directory to reach thousands of builders, educators, and enthusiasts across the continent.
            </p>
             <div className="text-gray-500 text-xs">
              Want an event featured? <button onClick={() => setShowSubmitModal(true)} className="text-yellow-500 hover:underline cursor-pointer">Submit it here</button>.
            </div>
            <div className="flex flex-wrap mt-3 items-center justify-center gap-3 mb-5">
              <a
                href="https://t.me/+KirVlW8gMMtlNDI8"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black  font-bold text-sm transition-all shadow-lg shadow-yellow-500/10"
              >
                Telegram Channel
              </a>
              <a
                href="https://chat.whatsapp.com/Ckny9TqxoWDJJ6MQlX5VpL"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black  font-bold text-sm transition-all shadow-lg shadow-yellow-500/10"
              >
                WhatsApp Group
              </a>
            </div>
           
          </div>

          {/* Stats Section */}
          <div className="p-6 md:p-8 bg-black/20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <div className="text-2xl md:text-3xl font-black text-yellow-500"><CountUp end={5240} /></div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Active Members</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl md:text-3xl font-black text-yellow-500"><CountUp end={850} suffix="+" /></div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Discussions</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl md:text-3xl font-black text-yellow-500"><CountUp end={125} /></div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Local Events</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl md:text-3xl font-black text-yellow-500"><CountUp end={28} /></div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0A0A0A] border-b border-white/10 p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-white">Submit Your Event</h2>
                <p className="text-sm text-gray-400 mt-1">Share your Bitcoin event with the community</p>
              </div>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setSubmitFormData({
                    eventName: '',
                    venue: '',
                    address: '',
                    date: '',
                    time: '',
                    description: '',
                    banner: '',
                    registrationUrl: '',
                  });
                  setImagePreview('');
                }}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <CloseIcon size={24} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvent} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Event Name *</label>
                <input
                  type="text"
                  value={submitFormData.eventName}
                  onChange={(e) => setSubmitFormData(prev => ({ ...prev, eventName: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500"
                  placeholder="e.g., Lagos Bitcoin Meetup"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Venue Name *</label>
                  <input
                    type="text"
                    value={submitFormData.venue}
                    onChange={(e) => setSubmitFormData(prev => ({ ...prev, venue: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500"
                    placeholder="e.g., Innovation Hub"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Physical Address *</label>
                  <input
                    type="text"
                    value={submitFormData.address}
                    onChange={(e) => setSubmitFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500"
                    placeholder="e.g., 123 Freedom Way"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Date *</label>
                  <input
                    type="date"
                    value={submitFormData.date}
                    onChange={(e) => setSubmitFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Time *</label>
                  <input
                    type="text"
                    value={submitFormData.time}
                    onChange={(e) => setSubmitFormData(prev => ({ ...prev, time: e.target.value }))}
                    required
                    placeholder="e.g., 6:00 PM"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Event Description *</label>
                <textarea
                  value={submitFormData.description}
                  onChange={(e) => setSubmitFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows="4"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none resize-none placeholder-gray-500"
                  placeholder="Tell everyone what this event is about..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Event Banner Image *</label>
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${imageMode === 'url' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-400'
                      }`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('file')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${imageMode === 'file' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-400'
                      }`}
                  >
                    Upload
                  </button>
                </div>

                {imageMode === 'url' ? (
                  <input
                    type="url"
                    value={submitFormData.banner instanceof Blob ? '' : submitFormData.banner}
                    onChange={(e) => setSubmitFormData(prev => ({ ...prev, banner: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500"
                    placeholder="https://example.com/banner.jpg"
                  />
                ) : (
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-yellow-500 file:text-black file:cursor-pointer"
                  />
                )}

                {imagePreview && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-white/10 h-32">
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Registration Link (Optional)</label>
                <input
                  type="url"
                  value={submitFormData.registrationUrl}
                  onChange={(e) => setSubmitFormData(prev => ({ ...prev, registrationUrl: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500"
                  placeholder="https://register.example.com/your-event"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Save size={18} />
                  {submitting ? 'Submitting...' : 'Submit Event'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-6 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ScrollToTop />
    </div>
  );
};

export default Community;
