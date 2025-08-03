
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CreditCard, Lock, User, Building, CheckCircle } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const planName = searchParams.get('plan') || 'starter';
  const basePrice = parseInt(searchParams.get('price') || '2999');
  
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState({
    organizationName: '',
    buyerName: '',
    buyerDesignation: '',
    customDesignation: '',
    email: ''
  });

  const calculatePrice = () => {
    let total = basePrice * selectedMonths;
    if (selectedMonths === 12) {
      total = total * 0.85;
    }
    return Math.round(total);
  };

  const planDetails = {
    starter: { name: 'Starter', color: 'text-blue-600' },
    professional: { name: 'Professional', color: 'text-green-600' },
    enterprise: { name: 'Enterprise', color: 'text-purple-600' }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalDesignation = paymentData.buyerDesignation === 'Other' 
        ? paymentData.customDesignation 
        : paymentData.buyerDesignation;

      const purchaseData = {
        plan_name: planName,
        plan_price: basePrice,
        billing_months: selectedMonths,
        total_amount: calculatePrice(),
        organization_name: paymentData.organizationName,
        buyer_name: paymentData.buyerName,
        buyer_designation: finalDesignation,
        buyer_email: paymentData.email
      };

      const { data, error } = await supabase.functions.invoke('send-purchase-confirmation', {
        body: purchaseData
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('There was an error processing your payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Successful!</h2>
            <p className="text-gray-600 mb-6">Please check your email for confirmation and login credentials.</p>
            <Link to="/">
              <Button className="bg-green-600 hover:bg-green-700">
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/workcurb-uploads/69f5022b-b9cf-4f7a-b5fb-6222d2a73060.png" 
                alt="Workcurb Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">WORKCURB</span>
            </Link>
            <Link to="/book-call">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200">
                Book a Call
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Form */}
          <div>
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <CreditCard className="w-5 h-5 mr-3" />
                  Purchase Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={paymentData.email}
                        onChange={(e) => setPaymentData({ ...paymentData, email: e.target.value })}
                        className="pl-10 h-10 text-sm border-2 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="organizationName" className="text-sm font-semibold text-gray-700">Name of Organization</Label>
                    <div className="relative mt-1">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="organizationName"
                        type="text"
                        value={paymentData.organizationName}
                        onChange={(e) => setPaymentData({ ...paymentData, organizationName: e.target.value })}
                        className="pl-10 h-10 text-sm border-2 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="buyerName" className="text-sm font-semibold text-gray-700">Name of Buyer</Label>
                    <Input
                      id="buyerName"
                      type="text"
                      value={paymentData.buyerName}
                      onChange={(e) => setPaymentData({ ...paymentData, buyerName: e.target.value })}
                      className="mt-1 h-10 text-sm border-2 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="buyerDesignation" className="text-sm font-semibold text-gray-700">Designation of Buyer</Label>
                    <Select 
                      value={paymentData.buyerDesignation} 
                      onValueChange={(value) => setPaymentData({ ...paymentData, buyerDesignation: value })}
                    >
                      <SelectTrigger className="mt-1 h-10 text-sm border-2">
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentData.buyerDesignation === 'Other' && (
                    <div>
                      <Label htmlFor="customDesignation" className="text-sm font-semibold text-gray-700">Please specify designation</Label>
                      <Input
                        id="customDesignation"
                        type="text"
                        value={paymentData.customDesignation}
                        onChange={(e) => setPaymentData({ ...paymentData, customDesignation: e.target.value })}
                        className="mt-1 h-10 text-sm border-2 focus:border-green-500"
                        required
                      />
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-base py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 mt-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : `Complete Payment - NPR ${calculatePrice().toLocaleString()}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <CardTitle className="text-xl text-gray-800">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-semibold">Selected Plan:</span>
                  <span className={`font-bold ${planDetails[planName as keyof typeof planDetails]?.color}`}>
                    {planDetails[planName as keyof typeof planDetails]?.name}
                  </span>
                </div>

                <div>
                  <Label htmlFor="months" className="text-sm font-semibold text-gray-700 mb-2 block">Billing Period</Label>
                  <Select value={selectedMonths.toString()} onValueChange={(value) => setSelectedMonths(parseInt(value))}>
                    <SelectTrigger className="h-10 text-sm border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Month</SelectItem>
                      <SelectItem value="3">3 Months</SelectItem>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months (15% OFF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t-2 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Price ({selectedMonths} month{selectedMonths > 1 ? 's' : ''})</span>
                    <span>NPR {(basePrice * selectedMonths).toLocaleString()}</span>
                  </div>
                  
                  {selectedMonths === 12 && (
                    <div className="flex justify-between text-sm text-green-600 font-semibold">
                      <span>Discount (15%)</span>
                      <span>-NPR {Math.round(basePrice * selectedMonths * 0.15).toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold text-lg border-t-2 pt-2 text-green-600">
                    <span>Total</span>
                    <span>NPR {calculatePrice().toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-bold mb-2 text-sm">What's included:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Full access to WorkCurb platform</li>
                    <li>• Employee management tools</li>
                    <li>• Time tracking & scheduling</li>
                    <li>• Analytics and reporting</li>
                    <li>• 24/7 customer support</li>
                  </ul>
                </div>

                <div className="flex items-center justify-center text-xs text-gray-500 bg-green-50 p-2 rounded-lg">
                  <Lock className="w-4 h-4 mr-2" />
                  Secure payment powered by SSL encryption
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
