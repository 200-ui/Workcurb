
import { useState } from 'react';
import { Button } from './ui/button';
import LoginModal from './LoginModal';
import EmployeeLoginModal from './EmployeeLoginModal';

const HeroSection = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEmployeeLoginModal, setShowEmployeeLoginModal] = useState(false);

  return (
    <section className="pt-24 pb-16 bg-white">
      {/* Container aligned with navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero content with green background and border radius */}
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-3xl p-8 lg:p-16 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-white">
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                  Simplify Your
                  <br />
                  Workforce
                  <br />
                  Management
                </h1>
                <p className="text-lg lg:text-xl text-green-100 leading-relaxed max-w-lg">
                  WorkCurb helps you streamline employee scheduling, attendance tracking, and workforce management all in one powerful platform.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 relative z-10">
                <Button 
                  size="lg" 
                  className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-full border-0 cursor-pointer"
                  onClick={() => setShowEmployeeLoginModal(true)}
                  type="button"
                >
                  Sign in as Employee
                </Button>
                <Button 
                  size="lg" 
                  className="bg-green-800 text-white hover:bg-green-900 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-full border-0 cursor-pointer"
                  onClick={() => setShowLoginModal(true)}
                  type="button"
                >
                  Sign in as HR/Admin
                </Button>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="flex justify-center items-center">
              <div className="w-full max-w-lg">
                <img 
                  src="/workcurb-uploads/09078041-3c1e-41f6-b7c6-19bef9a1848f.png"
                  alt="Workforce Management Network"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Wave Structure at Bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" className="w-full h-auto">
              <path fill="#ffffff" d="M0,96L48,85.3C96,75,192,53,288,58.7C384,64,480,96,576,96C672,96,768,64,864,58.7C960,53,1056,75,1152,85.3C1248,96,1344,96,1392,96L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
            </svg>
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        loginType="hr"
      />

      <EmployeeLoginModal 
        isOpen={showEmployeeLoginModal}
        onClose={() => setShowEmployeeLoginModal(false)}
      />
    </section>
  );
};

export default HeroSection;
