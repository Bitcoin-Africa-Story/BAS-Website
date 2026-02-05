import React from 'react';
import { EducationalHero, ProgramCard, WhyBitcoin , ProgramsSection , OtherBitcoinPrograms , BitcoinVideos , BitcoinResources} from '../components/sections';
import ScrollToTop from '../components/ScrollToTop';

const Education = () => {
  return (
    <div className="pt-16">
      <EducationalHero />
      <ProgramCard />
      <WhyBitcoin />
      <ProgramsSection />
      <OtherBitcoinPrograms />
      <BitcoinVideos/>
      <BitcoinResources />
<ScrollToTop />
    </div>
  );
};

export default Education;
