
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Calendar, Menu, X } from 'lucide-react';
import BookCallModal from './BookCallModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm' 
          : 'bg-white shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img 
                  src="/workcurb-uploads/69f5022b-b9cf-4f7a-b5fb-6222d2a73060.png" 
                  alt="Workcurb Logo" 
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold text-gray-900">WORKCURB</span>
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link 
                  to="/" 
                  className="relative text-gray-900 hover:text-green-600 px-3 py-2 text-base font-medium transition-colors group"
                >
                  Home
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                </Link>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="relative text-gray-900 hover:text-green-600 px-3 py-2 text-base font-medium transition-colors group"
                >
                  Pricing
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                </button>
                <Link 
                  to="/about" 
                  className="relative text-gray-900 hover:text-green-600 px-3 py-2 text-base font-medium transition-colors group"
                >
                  About Us
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                </Link>
                <Link 
                  to="/team" 
                  className="relative text-gray-900 hover:text-green-600 px-3 py-2 text-base font-medium transition-colors group"
                >
                  Team
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                </Link>
                <Link 
                  to="/contact" 
                  className="relative text-gray-900 hover:text-green-600 px-3 py-2 text-base font-medium transition-colors group"
                >
                  Contact Us
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                </Link>
              </div>
            </div>

            <div className="hidden md:flex items-center">
              <Link to="/book-call">
                <Button className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book a Call
                </Button>
              </Link>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-900 hover:text-green-600"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
              <Link to="/" className="text-gray-900 hover:text-green-600 block px-3 py-2 text-base font-medium">
                Home
              </Link>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-gray-900 hover:text-green-600 block px-3 py-2 text-base font-medium w-full text-left"
              >
                Pricing
              </button>
              <Link to="/about" className="text-gray-900 hover:text-green-600 block px-3 py-2 text-base font-medium">
                About Us
              </Link>
              <Link to="/team" className="text-gray-900 hover:text-green-600 block px-3 py-2 text-base font-medium">
                Team
              </Link>
              <Link to="/contact" className="text-gray-900 hover:text-green-600 block px-3 py-2 text-base font-medium">
                Contact Us
              </Link>
              <div className="px-3 py-2">
                <Link to="/book-call">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book a Call
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
