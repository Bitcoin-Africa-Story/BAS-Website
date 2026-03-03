import React from 'react';
import { Helmet } from 'react-helmet';
import { EducationalHero, ProgramCard, WhyBitcoin, ProgramsSection, OtherBitcoinPrograms, BitcoinVideos, BitcoinResources } from '../components/sections';
import ScrollToTop from '../components/ScrollToTop';

const Education = () => {
  return (
  
    <div className="pt-16">
      <Helmet>
        <title>Bitcoin Education Africa | Learn Bitcoin for Free</title>
        <meta name="description" content="Start your Bitcoin journey with our free educational programs, workshops, and resources tailored for the African context." />
        <link rel="canonical" href="https://bitcoinafricastory.com/education" />
      </Helmet>
      <EducationalHero />
      <ProgramCard />
      <WhyBitcoin />
      <ProgramsSection />
      <OtherBitcoinPrograms />
      <BitcoinVideos />
      <BitcoinResources />
      <ScrollToTop />
    </div>
  );
};

export default Education;
