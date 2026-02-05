import { Calendar, Users, Target, Heart, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ScrollToTop from '../components/ScrollToTop';
import CountUp from '../components/ui/CountUp';

const About = () => {
  const milestones = [
    { year: '2024', title: 'The Beginning', description: 'Started teaching Bitcoin to local communities in Nigeria.' },
    { year: '2024', title: 'First 100 Students', description: 'Reached our first 100 students across multiple cities' },
    { year: '2024', title: 'Growing Across Africa', description: 'Extended education programs to Ghana, Kenya, and South Africa' },
    { year: '2025', title: ' 300+ Community Members', description: 'Built a thriving network of students, learners, volunteers, and educators across Africa.' },
    { year: '2025', title: '6 Online Bitcoin Diplomas', description: 'Launched online Bitcoin learning programs to make education accessible to every African, anywhere.' },
    { year: '2025', title: '10+ Bitcoin Events', description: 'Hosted impactful events — from school sessions to classroom workshops, church outreach, youth hangouts, and community meetups.' },
    { year: '2025', title: 'Building Circular Economies', description: 'Launched initiatives like Bitcoin Ikorodu and continued scaling real Bitcoin adoption across African communities.' }
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      {/* <section className="py-20 px-6 bg-gradient-to-b from-gray-900/30 to-transparent">
        <div className="max-w-4xl mx-auto ">
          <div className="inline-block mb-6 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
            <span className="text-yellow-500 text-sm font-semibold">About Us</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            Empowering Africa Through <span className="text-yellow-500">Bitcoin</span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Our journey began with a simple belief: everyone deserves access to financial freedom. 
            For the past 2 years, we've been making that belief a reality across Africa.
          </p>
        </div>
      </section> */}

      <section id="hero" className="relative  flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/assets/aboutus.png')",
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
        </div>

        {/* Hero Content - two column layout */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
            {/* Left: Text content */}
            <div className="w-full lg:w-1/2 text-left mt-12 md:mt-10 lg:text-left">
              <div className="hidden sm:inline-block  mb-6 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                <span className="text-yellow-500 text-sm font-semibold">2+ Years of Proof-of-Quality-Works</span>
              </div>

              <h1 className="text-5xl sm:text-7xl md:text-6xl lg:text-7xl md:font-extrabold mb-4 leading-tight">
                <span>  Empowering  </span> <br className="sm:hidden" /> <span> Africa </span>  <br className="sm:hidden" /> <span>  Through </span> <br className="" /> <span className="text-[#FAD604]">  Bitcoin.  </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
                Our journey began with a simple belief: everyone deserves access to financial freedom.
              </p>

              <div className="flex mt-5  sm:flex-row gap-4 justify-start mb-6 w-full max-w-md">
                <Link
                  to="/donate"
                  className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-2 sm:py-3 bg-yellow-500 text-black font-bold text-base sm:text-lg  hover:bg-yellow-400 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-yellow-500/50"
                >
                  Donate
                  <ArrowRight className="ml-2" size={18} />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-2 sm:py-3 bg-transparent border-2 border-yellow-500 text-yellow-500 font-bold text-base sm:text-lg  hover:bg-yellow-500 hover:text-black transition-all duration-200"
                >
                  Contact Us
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 max-sm:hidden sm:grid-cols-4 gap-6 mt-6 max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-1"><CountUp end={2} suffix="+" /></div>
                  <div className="text-gray-400 text-sm">Years Teaching</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-1"><CountUp end={500} suffix="+" /></div>
                  <div className="text-gray-400 text-sm">Lives Changed</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-1"><CountUp end={50} suffix="+" /></div>
                  <div className="text-gray-400 text-sm">Communities</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-1"><CountUp end={100} suffix="%" /></div>
                  <div className="text-gray-400 text-sm">Free Education</div>
                </div>
              </div>
            </div>

            {/* Right: Image collage */}
            <div className="w-full hidden lg:w-1/2 flex items-center justify-center">
              <div className="relative w-[460px] h-[300px] lg:w-[520px] lg:h-[360px]">
                {/* Large top-right image */}
                <div className="absolute right-0 top-0 w-[320px] h-[240px] lg:w-[360px] lg:h-[270px] rounded-2xl overflow-hidden border border-gray-800 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1000&q=80"
                    alt="student-1"
                    className="w-full h-full object-cover grayscale-[10%]"
                  />
                </div>

                {/* Large bottom-left image */}
                <div className="absolute left-0 bottom-[-70px] w-[300px] h-[260px] lg:w-[340px] lg:h-[300px] rounded-2xl overflow-hidden border border-gray-800 shadow-xl transform -translate-y-6 lg:-translate-y-8">
                  <img
                    src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1000&q=80"
                    alt="student-2"
                    className="w-full h-full object-cover grayscale-[10%]"
                  />
                </div>

                {/* Small middle accent */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[212px] h-[212px] lg:w-[232px] lg:h-[232px] rounded-xl overflow-hidden border-2 border-yellow-500 shadow-md bg-gradient-to-tr from-yellow-500/10 to-transparent flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"
                    alt="student-3"
                    className="w-full h-full object-cover rounded-lg filter grayscale-[10%]"
                  />
                </div>

                {/* Decorative small circle */}
                <div className="absolute -left-6 -top-6 w-6 h-6 rounded-full bg-yellow-500/80 blur-sm" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Our <span className="text-yellow-500">Story</span>
              </h2>
              <div className="space-y-4 text-lg text-gray-300 leading-relaxed">
                <h5>From One Question to a Continental Movement</h5>

                <h5>Bitcoin Africa Story started with a question:</h5>
                <p>“Why are so many Africans still excluded from financial opportunities when Bitcoin exists?”</p>
                <p>
                  That question sparked a journey — from small, informal meetups in Nigeria to a growing pan-African network of learners, merchants, educators, youths, and creators discovering Bitcoin together.
                </p>
                <p>
                  Through collaboration with Bitcoin initiatives across the continent. We’ve seen the impact firsthand: When Africans understand Bitcoin, everything changes.
                </p>
                <p>
                  Today, Bitcoin Africa Story stands at the intersection of education, community empowerment, storytelling, and circular economy building.
                  We’re helping people not only learn Bitcoin, but use it in their daily lives.
                </p>

              </div>
            </div>

            <div className="space-y-6">
              <img
                src="/assets/communities.jpg"
                alt="Community"
                className="w-full shadow-2xl"
              />
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-gray-900 border border-gray-800 ">
                  <div className="text-3xl font-bold text-yellow-500 mb-2"><CountUp end={2} suffix="+" /></div>
                  <div className="text-gray-400">Years of Teaching</div>
                </div>
                <div className="p-6 bg-gray-900 border border-gray-800 ">
                  <div className="text-3xl font-bold text-yellow-500 mb-2"><CountUp end={500} suffix="+" /></div>
                  <div className="text-gray-400">Lives Changed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-gray-900/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="p-10 bg-gray-900 border border-gray-800 ">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                <Target className="text-yellow-500" size={32} />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Our <span className="text-yellow-500">Mission</span>
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                To accelerate Bitcoin adoption in Africa through education, community empowerment, grassroots initiatives, and storytelling all aimed at making Bitcoin practical for everyday Africans.

              </p>
            </div>

            {/* Vision */}
            <div className="p-10 bg-gray-900 border border-gray-800 ">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                <Heart className="text-yellow-500" size={32} />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Our <span className="text-yellow-500">Vision</span>
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                To build a financially empowered Africa where individuals, families, and communities understand Bitcoin, use Bitcoin, and benefit from its freedom, transparency, and opportunity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="text-yellow-500">Journey</span>
            </h2>
            <p className="text-xl text-gray-400">Milestones on the Road to Africa’s Bitcoin Future</p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-yellow-500/30" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-yellow-500  border-4 border-black transform -translate-x-1/2" />

                  {/* Content */}
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 pl-16 md:pl-0' : 'md:pl-12 pl-16 md:pl-0'}`}>
                    <div className="p-6 bg-gray-900 border border-gray-800  hover:border-yellow-500 transition-colors duration-300">
                      <div className="flex items-center mb-3">
                        <Calendar className="text-yellow-500 mr-2" size={20} />
                        <span className="text-yellow-500 font-bold">{milestone.year}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                      <p className="text-gray-400">{milestone.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-900/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="text-yellow-500">Values</span>
            </h2>
            <p className="text-xl text-gray-400">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-gray-900 border border-gray-800  text-center hover:border-yellow-500 transition-colors duration-300">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-yellow-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Community First</h3>
              <p className="text-gray-400 leading-relaxed">
                Bitcoin adoption grows from the grassroots — through people, not institutions.

              </p>
            </div>

            <div className="p-8 bg-gray-900 border border-gray-800  text-center hover:border-yellow-500 transition-colors duration-300">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="text-yellow-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Education Excellence</h3>
              <p className="text-gray-400 leading-relaxed">
                We prioritize accuracy, clarity, and accessibility in every lesson and resource.
              </p>
            </div>

            <div className="p-8 bg-gray-900 border border-gray-800  text-center hover:border-yellow-500 transition-colors duration-300">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-yellow-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Empowerment</h3>
              <p className="text-gray-400 leading-relaxed">
                We equip people with tools for independence, not dependency.

              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      {/* Professional CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 blur-[120px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block mb-4 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full"
            >
              <span className="text-yellow-500 text-sm font-bold uppercase tracking-widest">Join The Movement</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black mb-6 text-white"
            >
              Ready to Shape the <br className="hidden md:block" />
              <span className="text-yellow-500">Future of Africa?</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-400 max-w-2xl mx-auto"
            >
              Whether you're a beginner or a builder, there's a place for you in the Bitcoin revolution.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Education */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group bg-gray-900/50 border border-white/5 p-8  hover:border-yellow-500/30 transition-all duration-500 flex flex-col h-full"
            >
              <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="text-yellow-500" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Learn Bitcoin</h3>
              <p className="text-gray-400 mb-8 flex-grow leading-relaxed">
                Start your journey with our free comprehensive Bitcoin programs. Master the fundamentals of sound money.
              </p>
              <Link to="/education" className="inline-flex items-center text-yellow-500 font-bold hover:gap-3 transition-all">
                Get Started <ArrowRight className="ml-2" size={20} />
              </Link>
            </motion.div>

            {/* Card 2: Support */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group bg-gray-900/50 border border-white/5 p-8  hover:border-yellow-500/30 transition-all duration-500 flex flex-col h-full"
            >
              <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="text-yellow-500" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Support Our Work</h3>
              <p className="text-gray-400 mb-8 flex-grow leading-relaxed">
                Your contributions help us reach more communities and provide free Bitcoin education across Africa.
              </p>
              <Link to="/donate" className="inline-flex items-center text-yellow-500 font-bold hover:gap-3 transition-all">
                Donate Now <ArrowRight className="ml-2" size={20} />
              </Link>
            </motion.div>

            {/* Card 3: Community */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group bg-gray-900/50 border border-white/5 p-8  hover:border-yellow-500/30 transition-all duration-500 flex flex-col h-full"
            >
              <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="text-yellow-500" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Join Our Events</h3>
              <p className="text-gray-400 mb-8 flex-grow leading-relaxed">
                Connect with local Bitcoiners. Discover meetups, workshops, and conferences happening near you.
              </p>
              <Link to="/events" className="inline-flex items-center text-yellow-500 font-bold hover:gap-3 transition-all">
                Find Meetups <ArrowRight className="ml-2" size={20} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      <ScrollToTop />
    </div>
  );
};

export default About;