
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Linkedin } from 'lucide-react';

const teamMembers = [
  {
    name: 'Oscar Dhamala',
    position: 'CEO',
    description: 'Visionary leader with 10+ years in workforce management and business automation.',
    linkedinUrl: 'https://www.linkedin.com/in/oscar-dhamala-3b800a246/'
  },
  {
    name: 'Pujan Thapa',
    position: 'CTO',
    description: 'Technology expert specializing in scalable software architecture and AI integration.',
    linkedinUrl: 'https://www.linkedin.com/in/pujan-thapa-092b46287/'
  },
  {
    name: 'Kishor Acharya',
    position: 'Head of Product',
    description: 'Product strategist focused on user experience and feature development.',
    linkedinUrl: 'https://www.linkedin.com/in/kishor-acharya-7125562ba/'
  },
  {
    name: 'Akash Regmi',
    position: 'Lead Developer',
    description: 'Full-stack developer with expertise in modern web technologies and databases.',
    linkedinUrl: 'https://www.linkedin.com/in/akash-regmi-26123a318/'
  },
  {
    name: 'Sumit Rijal',
    position: 'Marketing Director',
    description: 'Growth expert driving customer acquisition and brand development strategies.',
    linkedinUrl: '#'
  }
];

const MaleUserSVG = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-24 h-24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50" r="48" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2"/>
    <circle cx="50" cy="35" r="12" fill="#6b7280"/>
    <path
      d="M25 75c0-13.8 11.2-25 25-25s25 11.2 25 25"
      fill="#6b7280"
    />
  </svg>
);

const Team = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="relative overflow-hidden pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 relative rounded-3xl my-8">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent rounded-3xl"></div>
            <div className="px-6 sm:px-8 lg:px-12 py-12 sm:py-16 text-center relative">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Our Team</h1>
              <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto font-medium">
                Meet the talented individuals behind WorkCurb's success.
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
          {/* First row with 3 members */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
            {teamMembers.slice(0, 3).map((member, index) => (
              <div 
                key={index}
                className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02] border"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center mx-auto mb-6 relative">
                    <MaleUserSVG />
                    {member.linkedinUrl !== '#' && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute -top-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 hover:scale-110 group"
                        title={`${member.name}'s LinkedIn Profile`}
                        style={{
                          boxShadow: '0 0 20px rgba(37, 99, 235, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                      >
                        <Linkedin className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                        <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-md group-hover:bg-blue-400/40 transition-all duration-300"></div>
                      </a>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-green-600 font-medium mb-4">{member.position}</p>
                  <p className="text-gray-600 leading-relaxed font-medium">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Second row with 2 members centered */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl">
              {teamMembers.slice(3, 5).map((member, index) => (
                <div 
                  key={index + 3}
                  className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02] border"
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center mx-auto mb-6 relative">
                      <MaleUserSVG />
                      {member.linkedinUrl !== '#' && (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute -top-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 hover:scale-110 group"
                          title={`${member.name}'s LinkedIn Profile`}
                          style={{
                            boxShadow: '0 0 20px rgba(37, 99, 235, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15)'
                          }}
                        >
                          <Linkedin className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                          <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-md group-hover:bg-blue-400/40 transition-all duration-300"></div>
                        </a>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-green-600 font-medium mb-4">{member.position}</p>
                    <p className="text-gray-600 leading-relaxed font-medium">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Team;
