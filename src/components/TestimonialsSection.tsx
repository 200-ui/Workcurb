
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from './ui/button';

const testimonials = [
  [
    {
      name: 'Rajesh Sharma',
      company: 'Tech Solutions Pvt. Ltd.',
      content: 'WorkCurb has completely transformed our workforce management. The scheduling feature alone has saved us 10+ hours per week.',
      rating: 4.5
    },
    {
      name: 'Priya Patel',
      company: 'Global Services Inc.',
      content: 'The analytics and reporting features provide incredible insights into our team\'s productivity. Highly recommended!',
      rating: 5
    },
    {
      name: 'Amit Kumar',
      company: 'Digital Marketing Agency',
      content: 'Customer support is exceptional. They helped us set up everything perfectly and the results have been amazing.',
      rating: 4
    }
  ],
  [
    {
      name: 'Sunita Rai',
      company: 'Manufacturing Corp',
      content: 'The time tracking feature is incredibly accurate and has helped us optimize our operations significantly.',
      rating: 4.5
    },
    {
      name: 'Ravi Adhikari',
      company: 'Logistics Solutions',
      content: 'WorkCurb\'s scheduling system handles our complex shift rotations effortlessly. Game changer for us!',
      rating: 5
    },
    {
      name: 'Maya Gurung',
      company: 'Retail Chain',
      content: 'The employee management features are comprehensive yet easy to use. Our HR team loves it.',
      rating: 4
    }
  ]
];

const TestimonialsSection = () => {
  const [currentSet, setCurrentSet] = useState(0);

  const nextSet = () => {
    setCurrentSet((prev) => (prev + 1) % testimonials.length);
  };

  const prevSet = () => {
    setCurrentSet((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />);
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-5 h-5 text-gray-300 fill-current" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-5 h-5 text-gray-300 fill-current" />);
    }

    return stars;
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-xl text-gray-600">Real feedback from businesses using WorkCurb</p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {testimonials[currentSet].map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSet}
              className="rounded-full p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSet}
              className="rounded-full p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
