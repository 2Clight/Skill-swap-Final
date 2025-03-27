
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";
import { Button } from '../ui/button';
import HowItWorksSection from '../HowItWorksSection';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const sections = ['hero', 'how-it-works', 'features', 'image-slider', 'testimonials', 'contact'];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);

        if (element) {
          const { offsetTop, offsetHeight } = element;

          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // Using refs for animations
  const fadeInRef = React.useRef(null);
  const fadeInUpRef = React.useRef(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const fadeInElements = document.querySelectorAll('.fade-in');

    fadeInElements.forEach(element => {
      // Apply initial classes
      element.classList.add('opacity-0', 'transition-all', 'duration-700');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Remove opacity-0 to make element visible
            element.classList.remove('opacity-0');
            element.classList.add('opacity-100');
            observer.unobserve(entry.target);
          }
        });
      }, options);

      observer.observe(element);
    });

    const staggeredElements = document.querySelectorAll('.staggered-item');

    staggeredElements.forEach((element, index) => {
      // Apply initial classes
      element.classList.add('opacity-0', 'translate-y-4');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              element.classList.remove('opacity-0', 'translate-y-4');
              element.classList.add('transition-all', 'duration-700', 'opacity-100', 'translate-y-0');
            }, index * 100);
            observer.unobserve(entry.target);
          }
        });
      }, options);

      observer.observe(element);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark text-white">
      {/* Header/Navbar */}
      <header className="w-full fixed top-0 z-50 flex items-center justify-between p-6 bg-dark-lighter bg-opacity-90 backdrop-blur-sm">
        <h1 className="text-2xl font-bold tracking-wide">
          <span className="text-teal">Skill</span>Swap
        </h1>
        <nav className="hidden md:flex space-x-6">
          <button
            onClick={() => scrollToSection('hero')}
            className={`nav-link ${activeSection === 'hero' ? 'active-nav-link' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className={`nav-link ${activeSection === 'how-it-works' ? 'active-nav-link' : ''}`}
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className={`nav-link ${activeSection === 'features' ? 'active-nav-link' : ''}`}
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('testimonials')}
            className={`nav-link ${activeSection === 'testimonials' ? 'active-nav-link' : ''}`}
          >
            Testimonials
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className={`nav-link ${activeSection === 'contact' ? 'active-nav-link' : ''}`}
          >
            Contact
          </button>
        </nav>
        <div className="flex space-x-4">
          <button
            className="px-4 py-2 bg-teal-500 text-black rounded-lg font-semibold hover:bg-teal-300 transition duration-300"
            onClick={() => navigate('/GetStarted')}
          >
            Login
          </button>
          <button
            className="px-4 py-2 bg-black text-teal-400 border border-teal-400 rounded-lg font-semibold hover:bg-white hover:border-transparent hover:text-black transition duration-300"
            onClick={() => navigate('/GetStarted')}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 mt-16 bg-cover bg-dark bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=60')",
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-dark bg-opacity-85"></div>

        <div className="relative z-10 max-w-5xl mx-auto fade-in">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-white">
            Swap Skills, <span className="text-teal-400">Grow</span> Together.
          </h1>
          <p className="mt-4 text-xl max-w-3xl mx-auto text-gray-300">
            Skill Swap is the ultimate platform to exchange knowledge, connect with talented individuals, and learn something new. Empower your journey, one skill at a time.
          </p>
          <div className="mt-10 space-x-4">
            <Button
              className="bg-teal hover:bg-teal-dark text-black font-bold px-8 py-6 rounded-full transition-all duration-300"
              onClick={() => navigate('/GetStarted')}
            >
              Get Started
            </Button>
            <Button
              variant="neutral"
              className="border-2 border-teal px-8 py-6 rounded-full font-bold transition-all duration-300"
              onClick={() => scrollToSection('how-it-works')}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Bezier Curve */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="block w-full h-[160px] md:h-[250px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#1a1a1a" /* Match next section background */
              fillOpacity="1"
              d="M0,230 
   L320,310 
   C500,330, 400,320, 460,320 
   C800,290, 920,240, 1040,210 
   C1160,170, 1300,140, 1440,180 
   L1440,200V320H0Z"


            ></path>
          </svg>
        </div>
      </section>

      {/* Next Section */}
      <section className="bg-dark py-20 px-6">
        <HowItWorksSection />
      </section>


      {/* Features Section */}
      <section id="features" className="w-full py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 fade-in">Why Skill Swap?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-xl staggered-item">
              <h3 className="text-xl font-bold mb-4 text-teal">Skill Sharing</h3>
              <p className="text-gray-300">
                Share your expertise and learn from others in a collaborative and supportive environment.
              </p>
            </div>

            <div className="glass-card p-8 rounded-xl staggered-item">
              <h3 className="text-xl font-bold mb-4 text-teal">Community Driven</h3>
              <p className="text-gray-300">
                Join a vibrant community of learners and mentors who are passionate about growth.
              </p>
            </div>

            <div className="glass-card p-8 rounded-xl staggered-item">
              <h3 className="text-xl font-bold mb-4 text-teal">Flexible Learning</h3>
              <p className="text-gray-300">
                Learn at your own pace and on your own terms, anytime, anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="w-full py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 fade-in">What Our Users Say</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Web Developer",
                quote: "Skill Swap completely changed how I approach learning. I was able to teach graphic design while learning JavaScript!",
                image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGVvcGxlfGVufDB8fDB8fHww", // Random woman face
              },
              {
                name: "Michael Chen",
                role: "Photographer",
                quote: "I've met amazing people through this platform. The skills I've gained have been invaluable for my career growth.",
                image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cGVvcGxlfGVufDB8fDB8fHww", // Random man face
              },
              {
                name: "Emma Williams",
                role: "Language Teacher",
                quote: "As someone who loves teaching languages, this platform has allowed me to help others while improving my digital marketing skills.",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVvcGxlfGVufDB8fDB8fHww", // Random girl face
              },
            ].map((testimonial, index) => (
              <div key={index} className="glass-card p-8 rounded-xl text-left staggered-item">
                <div className="mb-4">
                  {/* 5 stars */}
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-teal text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Contact Us Section */}
      <section id="contact" className="w-full py-24 px-6 bg-dark-lighter">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 fade-in">Contact Us</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="fade-in">
              <h3 className="text-2xl font-bold mb-6">Get In Touch</h3>
              <p className="text-gray-300 mb-8">Have questions or feedback? Reach out to us!</p>

              {/* Social Media Icons */}
              <div className="flex space-x-6 mb-8">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-teal text-2xl hover:text-teal-light transition-colors">
                  <Facebook size={24} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-teal text-2xl hover:text-teal-light transition-colors">
                  <Twitter size={24} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-teal text-2xl hover:text-teal-light transition-colors">
                  <Instagram size={24} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-teal text-2xl hover:text-teal-light transition-colors">
                  <Linkedin size={24} />
                </a>
                <a href="mailto:support@skillswap.com" className="text-teal text-2xl hover:text-teal-light transition-colors">
                  <Mail size={24} />
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass-card p-8 rounded-xl fade-in">
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 bg-dark-lightest text-white border border-gray-700 rounded-lg focus:outline-none focus:border-teal"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-3 bg-dark-lightest text-white border border-gray-700 rounded-lg focus:outline-none focus:border-teal"
                    required
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Your Message"
                    className="w-full px-4 py-3 bg-dark-lightest text-white border border-gray-700 rounded-lg focus:outline-none focus:border-teal"
                    rows={4}
                    required
                  ></textarea>

                </div>
                <Button
                  type="submit"
                  className="w-full bg-teal hover:bg-teal-dark text-black font-bold py-3 transition-all duration-300"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 bg-dark-lightest">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">
            © {new Date().getFullYear()} SkillSwap. All Rights Reserved.
          </p>
          <div className="flex space-x-8">
            <a href="#" className="text-gray-400 hover:text-teal transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-teal transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-teal transition-colors">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
};



export default LandingPage;