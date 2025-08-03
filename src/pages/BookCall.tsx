
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../components/ui/use-toast';

const BookCall = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const bookingData = {
        fullName: formData.fullName,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        preferredDate: date ? format(date, 'yyyy-MM-dd') : undefined,
        preferredTime: time,
        message: formData.message
      };

      // Call the edge function to handle both database storage and email sending
      const { data, error } = await supabase.functions.invoke('send-booking-email', {
        body: bookingData
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Call booked successfully!",
        description: "We've received your booking request and will contact you soon to confirm the details.",
      });

      // Reset form
      setFormData({ fullName: '', email: '', company: '', phone: '', message: '' });
      setDate(undefined);
      setTime('');
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Error booking call",
        description: "There was a problem with your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Custom Navbar for Book Call Page */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img 
                  src="/workcurb-uploads/69f5022b-b9cf-4f7a-b5fb-6222d2a73060.png" 
                  alt="Workcurb Logo" 
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold text-gray-900">WORKCURB</span>
              </Link>
            </div>
            <div>
              <Link to="/">
                <Button className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200">
                  Go to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <section className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-green-500 text-white p-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Book a Call With Our Team</h1>
              <p className="text-lg opacity-90">Schedule a personalized consultation to discuss how WorkCurb can help your business</p>
            </div>
            
            {/* Form Section */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName" className="text-base font-medium text-gray-700 mb-2 block">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="h-12 text-base"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-base font-medium text-gray-700 mb-2 block">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 text-base"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company" className="text-base font-medium text-gray-700 mb-2 block">Company Name</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Your Company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="h-12 text-base"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-base font-medium text-gray-700 mb-2 block">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+977 98XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-12 text-base"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium text-gray-700 mb-2 block">Preferred Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-12 text-base",
                            !date && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium text-gray-700 mb-2 block">Preferred Time *</Label>
                    <Select value={time} onValueChange={setTime} disabled={isSubmitting}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select a time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="message" className="text-base font-medium text-gray-700 mb-2 block">What would you like to discuss?</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your workforce management needs..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="text-base resize-none"
                    disabled={isSubmitting}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold rounded-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Booking Your Call...' : 'Book Your Call'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookCall;
