import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import EventDetails from './pages/EventDetails';
import Resources from './pages/Resources';
import Community from './pages/community';
import Contact from './pages/Contact';
import Education from './pages/Education';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './dashboard/Dashboard';
import UploadNews from './dashboard/UploadNews';
import UploadEvent from './dashboard/UploadEvent';
import UploadCommunities from './dashboard/UploadCommunities';
import SubmittedStories from './dashboard/SubmittedStories';
import SubmittedEvents from './dashboard/SubmittedEvents';
import UploadPrograms from './dashboard/UploadEducationPrograms';
import UploadOtherPrograms from './dashboard/UploadOtherPrograms';
import UploadVideos from './dashboard/UploadBitcoinVideos';
import UploadWhyVideo from './dashboard/UploadWhyBitcoinVideo';
import UploadResources from './dashboard/UploadBitcoinResources';
import UploadTestimonials from './dashboard/UploadTestimonials';
import UploadEducationTestimonials from './dashboard/UploadEducationTestimonials';
import Header from './components/Header';
import Footer from './components/Footer';
import Donate from './pages/Donate';
import { NewsProvider } from './context/NewsContext';

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <>
      {!isDashboard && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/news" element={<Blog />} />
        <Route path="/news/:slug" element={<BlogPost />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/education" element={<Education />} />
        <Route path="/events" element={<Community />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
          <Route index element={<UploadNews />} />
          <Route path="upload-news" element={<UploadNews />} />
          <Route path="upload-event" element={<UploadEvent />} />
          <Route path="submitted-events" element={<SubmittedEvents />} />
          <Route path="upload-communities" element={<UploadCommunities />} />
          <Route path="submitted-stories" element={<SubmittedStories />} />
          <Route path="upload-programs" element={<UploadPrograms />} />
          <Route path="upload-other-programs" element={<UploadOtherPrograms />} />
          <Route path="upload-videos" element={<UploadVideos />} />
          <Route path="upload-resources" element={<UploadResources />} />
          <Route path="upload-testimonials" element={<UploadTestimonials />} />
          <Route path="upload-education-testimonials" element={<UploadEducationTestimonials />} />
          <Route path="upload-programs" element={<UploadPrograms />} />
          <Route path="upload-other-programs" element={<UploadOtherPrograms />} />
          <Route path="upload-videos" element={<UploadVideos />} />
          <Route path="upload-why-video" element={<UploadWhyVideo />} />
          <Route path="upload-resources" element={<UploadResources />} />
        </Route>
      </Routes>
      {!isDashboard && <Footer />}
    </>
  );
}

import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <NewsProvider>
            <AppContent />
            <Toaster />
          </NewsProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;