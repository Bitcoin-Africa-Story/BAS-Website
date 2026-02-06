import React, { useState } from 'react';
import { Mail, MapPin, Send, Twitter, MessageCircle } from 'lucide-react';
import { ContactForm } from '../components/sections';
import ScrollToTop from '../components/ScrollToTop';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';

const Contact = () => {
  // Define a minimal icon size for the smallest screens (e.g., 18px)
  const MINIMAL_ICON_SIZE = 18;

  const [modal, setModal] = useState({ open: false, title: '', message: '' });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Handle newsletter subscription
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setIsSubscribing(true);
    try {
      // Check if email already exists
      const q = query(collection(db, 'newsletterSubscribers'), where('email', '==', newsletterEmail.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.info('You\'re already subscribed to our newsletter!');
        setIsSubscribing(false);
        return;
      }

      // Add new subscriber
      await addDoc(collection(db, 'newsletterSubscribers'), {
        email: newsletterEmail.toLowerCase().trim(),
        subscribedAt: serverTimestamp()
      });

      toast.success('Successfully subscribed to our newsletter!');
      setNewsletterEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      {/* Reduced default horizontal padding to px-4 */}
      <section id="hero" className="py-16 sm:py-20 px-4 bg-gradient-to-b from-gray-900/30 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <div className="hidden sm:inline-block mb-4 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
            <span className="text-yellow-500 text-xs sm:text-sm font-semibold">Get In Touch</span>
          </div>
          {/* Reduced H1 size for ultra-small screens */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6">
            Let's <span className="text-yellow-500">Connect</span>
          </h1>
          {/* Reduced P size for ultra-small screens */}
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            Have questions about Bitcoin? Want to collaborate? Or just want to say hello?
            We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Reduced default gap to 8 and used larger gaps for larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Contact Form */}
            <div>
              {/* Reduced H2 size for ultra-small screens */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
                Send Us a <span className="text-yellow-500">Message</span>
              </h2>
              <ContactForm />
            </div>

            {/* Contact Info & Socials */}
            <div>
              {/* Reduced H2 size for ultra-small screens */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
                Other Ways to <span className="text-yellow-500">Reach Us</span>
              </h2>

              {/* Contact Cards */}
              <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                {/* Reduced default padding to p-3 */}
                <div className="p-3 sm:p-4 md:p-6 bg-gray-900 border border-gray-800  hover:border-yellow-500 transition-colors duration-300">
                  <div className="flex items-start">
                    {/* Reduced icon wrapper size */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-yellow-500/10  flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                      <Mail className="text-yellow-500" size={MINIMAL_ICON_SIZE} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold mb-1">Email</h3>
                      <a
                        href="mailto:Bitcoinafricastory@proton.me"
                        className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-xs sm:text-sm"
                      >
                        Bitcoinafricastory@proton.me
                      </a>
                    </div>
                  </div>
                </div>

                {/* Reduced default padding to p-3 */}
                <div className="p-3 sm:p-4 md:p-6 bg-gray-900 border border-gray-800  hover:border-yellow-500 transition-colors duration-300">
                  <div className="flex items-start">
                    {/* Reduced icon wrapper size */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-yellow-500/10  flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                      <MapPin className="text-yellow-500" size={MINIMAL_ICON_SIZE} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold mb-1">Location</h3>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Operating across Africa<br />
                        Based in Nigeria
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Connect on Social Media</h3>
                <div className="space-y-3 sm:space-y-4">
                  <a
                    href="https://x.com/story_bitcoin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 sm:p-4 bg-gray-900 border border-gray-800  hover:border-yellow-500 hover:bg-gray-800 transition-all duration-300 group"
                  >
                    {/* Reduced icon wrapper size */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-500/10  flex items-center justify-center mr-3 sm:mr-4">
                      <Twitter className="text-yellow-500" size={MINIMAL_ICON_SIZE} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold group-hover:text-yellow-500 transition-colors duration-200">Twitter / X</div>
                      <div className="text-xs text-gray-400">Follow for daily Bitcoin insights</div>
                    </div>
                  </a>

                  <a
                    href="https://t.me/+KirVlW8gMMtlNDI8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 sm:p-4 bg-gray-900 border border-gray-800  hover:border-yellow-500 hover:bg-gray-800 transition-all duration-300 group"
                  >
                    {/* Reduced icon wrapper size */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-500/10  flex items-center justify-center mr-3 sm:mr-4">
                      <Send className="text-yellow-500" size={MINIMAL_ICON_SIZE} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold group-hover:text-yellow-500 transition-colors duration-200">Telegram</div>
                      <div className="text-xs text-gray-400">Join our community chat</div>
                    </div>
                  </a>

                  <a
                    href="https://primal.net/p/nprofile1qqs0tmrphute79adfe4r3h8qdkdgqw3fz9244238x2ss53lmhft3jug4hhw4r"
                    target="_blank"
                    // rel="noopener noreferrer"
                    className="flex items-center p-3 sm:p-4 bg-gray-900 border border-gray-800  hover:border-yellow-500 hover:bg-gray-800 transition-all duration-300 group"
                  >
                    {/* Reduced icon wrapper size */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-500/10  flex items-center justify-center mr-3 sm:mr-4">
                      <MessageCircle className="text-yellow-500" size={MINIMAL_ICON_SIZE} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold group-hover:text-yellow-500 transition-colors duration-200">Nostr</div>
                      <div className="text-xs text-gray-400">Connect on the decentralized protocol</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Response Time Notice */}
              {/* Reduced default padding to p-3 */}
              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/30 ">
                {/* Reduced default text size to text-xs */}
                <p className="text-gray-300 text-xs">
                  <strong className="text-yellow-500">Response Time:</strong> We typically respond within 24-48 hours.
                  For urgent matters, reach out on Twitter or Telegram for faster responses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-12 sm:py-20 px-4 bg-gradient-to-b from-gray-900/30 to-transparent">
        <div className="max-w-4xl mx-auto">
          {/* Reduced default padding to p-6 */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30  p-6 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Stay Updated
            </h2>
            {/* Reduced P size for ultra-small screens */}
            <p className="text-sm sm:text-base text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive Bitcoin education content and community updates.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg mx-auto"
              onSubmit={handleNewsletterSubmit}
            >
              {/* Reduced default padding on input */}
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 bg-gray-900 border border-gray-700  text-white text-sm sm:text-base focus:outline-none focus:border-yellow-500"
                required
                disabled={isSubscribing}
              />
              {/* Reduced default padding on button */}
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-6 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-yellow-500 text-black font-bold  hover:bg-yellow-400 transition-colors duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </section>
      <ScrollToTop />
    </div>
  );
};

export default Contact;