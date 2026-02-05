import React, { useState } from 'react';
import { Send } from 'lucide-react';
import StatusModal from '../../dashboard/components/StatusModal';

const ContactForm = ({ onSubmitCallback }) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const [modal, setModal] = useState({ open: false, title: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setModal({ open: true, title: 'Thanks', message: "Thank you for your message! We'll get back to you soon." });
    setFormData({ name: '', email: '', subject: '', message: '' });
    if (onSubmitCallback) onSubmitCallback(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">Your Name</label>
        <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required
          className="w-full px-4 py-3 bg-gray-900 border border-gray-800  text-white focus:outline-none focus:border-yellow-500 transition-colors duration-200" />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
        <input id="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" type="email" required
          className="w-full px-4 py-3 bg-gray-900 border border-gray-800  text-white focus:outline-none focus:border-yellow-500 transition-colors duration-200" />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-semibold text-gray-300 mb-2">Subject</label>
        <input id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="I have a question about..." required
          className="w-full px-4 py-3 bg-gray-900 border border-gray-800  text-white focus:outline-none focus:border-yellow-500 transition-colors duration-200" />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-2">Message</label>
        <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows="6" placeholder="Tell us what's on your mind..." required
          className="w-full px-4 py-3 bg-gray-900 border border-gray-800  text-white focus:outline-none focus:border-yellow-500 transition-colors duration-200 resize-none" />
      </div>

      <button type="submit" className="w-full px-8 py-4 bg-yellow-500 text-black font-bold text-lg  hover:bg-yellow-400 transition-all duration-200 hover:scale-105 flex items-center justify-center">
        <Send size={20} className="mr-2" />
        Send Message
      </button>
    </form>
    <StatusModal open={modal.open} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, open: false })} />
    </>
  );
};

export default ContactForm;
