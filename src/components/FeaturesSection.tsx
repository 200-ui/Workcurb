
import React from 'react';
import { Users, Clock, BarChart3, Shield, Calendar, Headphones } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Employee Management',
    description: 'Comprehensive employee information management with role-based access and permissions control.'
  },
  {
    icon: Clock,
    title: 'Time Tracking',
    description: 'Advanced time tracking with automatic clock-in/out, overtime calculation and real-time monitoring.'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Detailed reports and analytics to track performance, productivity and operational efficiency.'
  },
  {
    icon: Shield,
    title: 'Compliance',
    description: 'Stay compliant with labor laws and regulations with automated compliance monitoring and alerts.'
  },
  {
    icon: Calendar,
    title: 'Scheduling',
    description: 'Smart scheduling with conflict detection, availability management and automated notifications.'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer support with dedicated account managers for enterprise clients.'
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mr-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything you need to manage your workforce
            </h2>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features that work together to simplify workforce management and boost productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:transform hover:scale-[1.02] border hover:border-green-200"
            >
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
