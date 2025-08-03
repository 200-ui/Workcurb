
import React from 'react';
import { Shield, Clock, Zap, Users, BarChart, Headphones } from 'lucide-react';

const reasons = [
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with 99.9% uptime guarantee and regular backups to keep your data safe.'
  },
  {
    icon: Clock,
    title: 'Save Time',
    description: 'Automate routine tasks and reduce manual work by up to 60% with our intelligent automation features.'
  },
  {
    icon: Zap,
    title: 'Easy to Use',
    description: 'Intuitive interface designed for users of all technical levels. Get started in minutes, not hours.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Foster better communication and collaboration across your entire organization with real-time updates.'
  },
  {
    icon: BarChart,
    title: 'Proven Results',
    description: 'Join thousands of satisfied customers who have improved their productivity by an average of 35%.'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our dedicated support team is available round the clock to help you succeed with WorkCurb.'
  }
];

const WhyChooseSection = () => {
  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mr-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Why Choose WorkCurb?</h2>
          </div>
          <p className="text-lg sm:text-xl text-gray-600">Discover why thousands of businesses trust us for their workforce management needs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {reasons.map((reason, index) => (
            <div 
              key={index}
              className="bg-white p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:transform hover:scale-[1.02]"
            >
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <reason.icon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{reason.title}</h3>
              <p className="text-gray-600 leading-relaxed">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
