
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Users, Target, Eye, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="relative overflow-hidden pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 relative rounded-3xl my-8">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent rounded-3xl"></div>
            <div className="px-6 sm:px-8 lg:px-12 py-12 sm:py-16 text-center relative">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">About WorkCurb</h1>
              <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto font-medium">
                Revolutionizing workforce management through intelligent automation and innovative solutions.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 120" className="w-full h-auto">
                <path fill="#ffffff" d="M0,96L48,85.3C96,75,192,53,288,58.7C384,64,480,96,576,96C672,96,768,64,864,58.7C960,53,1056,75,1152,85.3C1248,96,1344,96,1392,96L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6 font-medium">
                WorkCurb was founded with a simple mission: to simplify workforce management for businesses of all sizes. 
                We recognized that traditional methods of managing employees, schedules, and operations were outdated and inefficient.
              </p>
              <p className="text-lg text-gray-600 mb-6 font-medium">
                Our team of experts combines years of experience in HR technology, automation, and business operations 
                to deliver a platform that truly transforms how organizations manage their workforce.
              </p>
              <p className="text-lg text-gray-600 font-medium">
                Today, we're proud to serve thousands of businesses across Nepal and beyond, helping them achieve 
                greater efficiency, compliance, and employee satisfaction.
              </p>
            </div>
            <div className="flex justify-center">
              <img 
                src="/workcurb-uploads/69f5022b-b9cf-4f7a-b5fb-6222d2a73060.png"
                alt="WorkCurb Logo"
                className="w-full max-w-md h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To empower businesses with intelligent workforce management solutions that drive efficiency and growth.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To be the leading workforce management platform, transforming how businesses operate globally.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Values</h3>
              <p className="text-gray-600">
                Innovation, integrity, customer success, and continuous improvement guide everything we do.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Promise</h3>
              <p className="text-gray-600">
                Delivering reliable, secure, and user-friendly solutions that exceed expectations every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
