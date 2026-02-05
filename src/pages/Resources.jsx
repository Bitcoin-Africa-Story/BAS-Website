import React, { useState } from 'react';
import { Download, FileText, BookOpen, Shield, ExternalLink } from 'lucide-react';
import StatusModal from '../dashboard/components/StatusModal';
import { resources } from '../mock';

const Resources = () => {
  const recommendedWallets = [
    { name: 'BlueWallet', description: 'User-friendly mobile Bitcoin wallet', url: 'https://bluewallet.io' },
    { name: 'Muun', description: 'Simple and secure Bitcoin wallet', url: 'https://muun.com' },
    { name: 'Sparrow', description: 'Desktop Bitcoin wallet for power users', url: 'https://sparrowwallet.com' }
  ];

  const learningResources = [
    { name: 'Bitcoin.org', description: 'Official Bitcoin information and resources', url: 'https://bitcoin.org' },
    { name: 'Learn Me A Bitcoin', description: 'Technical Bitcoin education', url: 'https://learnmeabitcoin.com' },
    { name: 'Bitcoin Magazine', description: 'Latest Bitcoin news and insights', url: 'https://bitcoinmagazine.com' }
  ];

  const [modal, setModal] = useState({ open: false, title: '', message: '' });

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-900/30 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <div className="hidden sm:inline-block mb-6 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
            <span className="text-yellow-500 text-sm font-semibold">Learning Resources</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            Bitcoin <span className="text-yellow-500">Resources</span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Everything you need to start your Bitcoin journey. Guides, tools, and trusted resources
            to help you learn and grow.
          </p>
        </div>
      </section>

      {/* Downloadable Resources */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Download <span className="text-yellow-500">Guides</span>
            </h2>
            <p className="text-lg text-gray-400">Free educational materials to accelerate your learning</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="group p-8 bg-gray-900 border border-gray-800 rounded-xl hover:border-yellow-500 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    {resource.type === 'PDF' ? (
                      <FileText className="text-yellow-500" size={28} />
                    ) : resource.type === 'Guide' ? (
                      <BookOpen className="text-yellow-500" size={28} />
                    ) : (
                      <FileText className="text-yellow-500" size={28} />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">
                    {resource.type}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-500 transition-colors duration-200">
                  {resource.title}
                </h3>
                <p className="text-gray-400 mb-6">{resource.description}</p>
                <a
                  href={resource.downloadUrl}
                  className="inline-flex items-center text-yellow-500 font-semibold hover:text-yellow-400 transition-colors duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    setModal({ open: true, title: 'Coming Soon', message: 'Download feature will be available soon!' });
                  }}
                >
                  <Download size={18} className="mr-2" />
                  Download Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Wallets */}
      <section className="py-16 px-6 bg-gradient-to-b from-transparent via-gray-900/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Recommended <span className="text-yellow-500">Wallets</span>
            </h2>
            <p className="text-lg text-gray-400">Secure and trusted Bitcoin wallets for storing your funds</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedWallets.map((wallet, index) => (
              <div
                key={index}
                className="p-8 bg-gray-900 border border-gray-800 rounded-xl hover:border-yellow-500 transition-all duration-300 text-center"
              >
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="text-yellow-500" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">{wallet.name}</h3>
                <p className="text-gray-400 mb-6">{wallet.description}</p>
                <a
                  href={wallet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-yellow-500 font-semibold hover:text-yellow-400 transition-colors duration-200"
                >
                  Visit Website
                  <ExternalLink size={16} className="ml-2" />
                </a>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <p className="text-gray-300 text-center">
              <strong className="text-yellow-500">Security Tip:</strong> Always download wallets from official websites.
              Never share your seed phrase with anyone, and always keep backups in a secure location.
            </p>
          </div>
        </div>
      </section>

      {/* Learning Resources */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">
              External <span className="text-yellow-500">Resources</span>
            </h2>
            <p className="text-lg text-gray-400">Trusted websites and platforms for continued learning</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learningResources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-8 bg-gray-900 border border-gray-800 rounded-xl hover:border-yellow-500 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-6">
                  <BookOpen className="text-yellow-500" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-500 transition-colors duration-200">
                  {resource.name}
                </h3>
                <p className="text-gray-400 mb-4">{resource.description}</p>
                <span className="inline-flex items-center text-yellow-500 font-semibold">
                  Visit Site
                  <ExternalLink size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Video Resources Section (Optional) */}
      <section className="py-16 px-6 bg-gradient-to-b from-gray-900/30 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Video <span className="text-yellow-500">Tutorials</span>
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Visual guides and tutorials to help you understand Bitcoin concepts
          </p>
          <div className="aspect-video bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center">
            <p className="text-gray-500">Video tutorials coming soon</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Need More Help?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Have questions or need personalized guidance? Reach out to us and we'll help you on your Bitcoin journey.
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-4 bg-yellow-500 text-black font-bold text-lg rounded-lg hover:bg-yellow-400 transition-all duration-200 hover:scale-105"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Resources;