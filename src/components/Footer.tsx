
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Button } from './ui/button';
import AdminLoginModal from './AdminLoginModal';

const Footer = () => {
  const [showAdminModal, setShowAdminModal] = useState(false);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <img 
                src="/workcurb-uploads/69f5022b-b9cf-4f7a-b5fb-6222d2a73060.png" 
                alt="Workcurb Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold">WORKCURB</span>
            </div>
            <p className="text-gray-400 mb-6">
              Simplifying workforce management through intelligent automation and innovative solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/team" className="text-gray-400 hover:text-white transition-colors">Our Team</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Press</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Admin Access</h3>
            <div className="space-y-4">
              <Button 
                onClick={() => setShowAdminModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm w-fit"
              >
                Workcurb Admin
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-400">
                <MapPin className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>IIMS Dhobidhara, Kathmandu</span>
              </li>
              <li className="flex items-center text-gray-400">
                <Phone className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>+977-9869112525</span>
              </li>
              <li className="flex items-center text-gray-400">
                <Mail className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>info.workcurb@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
            <p className="text-gray-400 mb-2 sm:mb-0">
              © 2025 WorkCurb. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Designed and Developed By Team 41</a>
            </div>
          </div>
        </div>
      </div>

      <AdminLoginModal 
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
    </footer>
  );
};

export default Footer;
