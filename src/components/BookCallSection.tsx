
import React from 'react';
import { Button } from './ui/button';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookCallSection = () => {
  return (
    <section className="relative overflow-hidden py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 relative rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent rounded-3xl"></div>
          <div className="px-6 sm:px-8 lg:px-12 py-12 sm:py-16 text-center relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to simplify your workforce management?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto font-medium">
              Start with a free consultation. Our experts will show you how WorkCurb can transform your business operations.
            </p>
            <Link to="/book-call">
              <Button 
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 z-10 relative"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book a Call
              </Button>
            </Link>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" className="w-full h-auto">
              <path fill="#ffffff" d="M0,96L48,85.3C96,75,192,53,288,58.7C384,64,480,96,576,96C672,96,768,64,864,58.7C960,53,1056,75,1152,85.3C1248,96,1344,96,1392,96L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookCallSection;
