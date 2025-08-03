
import React from 'react';
import { Users, Clock, TrendingUp, Heart } from 'lucide-react';

const stats = [
  { number: '1,000+', label: 'Active Users', icon: Users },
  { number: '45%', label: 'Time Saved Daily', icon: Clock },
  { number: '28%', label: 'Increase in Productivity', icon: TrendingUp },
  { number: '98%', label: 'Customer Satisfaction', icon: Heart }
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Making a Difference</h2>
          <p className="text-lg text-gray-600 font-medium">Our platform delivers real results across organizations</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
