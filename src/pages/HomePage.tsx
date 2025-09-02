import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import AboutStory from '../components/AboutStory';
import Menu from '../components/Menu';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import SloganSlider from '../components/SloganSlider';
import ReviewsSlider from '../components/ReviewsSlider';

const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    // Handle scrolling to specific section when navigating from other pages
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <>
      <Header />
      <Hero />
      <SloganSlider />
      <About />
      <AboutStory />
      <Menu />
      <ReviewsSlider />
      <Contact />
      <Footer />
    </>
  );
};

export default HomePage;
