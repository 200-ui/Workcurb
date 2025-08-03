
import React from 'react';
import { Button } from './ui/button';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    price: '2,999',
    period: '/month',
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 50 employees',
      'Basic scheduling',
      'Time tracking',
      'Basic reports',
      'Email support'
    ],
    popular: false
  },
  {
    name: 'Professional',
    price: '9,999',
    period: '/month',
    description: 'Best for growing businesses',
    features: [
      'Up to 500 employees',
      'Advanced scheduling',
      'Advanced analytics',
      'Priority support'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: '19,999',
    period: '/month',
    description: 'For large organizations',
    features: [
      'Unlimited employees',
      'Full feature access',
      'Custom workflows',
      'Dedicated support',
      'On-premise option',
      'Training & onboarding'
    ],
    popular: false
  }
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 font-medium">Choose the plan that best fits your organization</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white rounded-2xl shadow-lg p-8 relative hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col ${
                plan.popular ? 'border-2 border-green-500 transform scale-105' : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-gray-900">NPR</span>
                  <span className="text-3xl font-bold text-gray-900 ml-1">{plan.price}</span>
                  <span className="text-base font-medium text-gray-600">{plan.period}</span>
                </div>
                <p className="text-gray-600 font-medium">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to={`/payment?plan=${plan.name.toLowerCase()}&price=${plan.price.replace(',', '')}`}>
                <Button 
                  className={`w-full py-3 text-lg font-semibold rounded-lg transition-all duration-200 ${
                    plan.popular 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
