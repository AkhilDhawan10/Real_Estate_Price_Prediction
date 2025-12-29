'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Plan {
  type: string;
  name: string;
  price: number;
  duration: string;
  savings?: number;
  features: string[];
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        console.log('Loading subscription data...');
        
        // Load plans and subscription status
        const plansPromise = api.get('/subscriptions/plans');
        const subscriptionPromise = api.get('/subscriptions/status');
        
        const [plansResponse, subscriptionResponse] = await Promise.allSettled([
          plansPromise,
          subscriptionPromise,
        ]);

        if (!isMounted) return;

        // Handle plans response
        if (plansResponse.status === 'fulfilled') {
          const plansData = plansResponse.value.data?.plans || plansResponse.value.data || [];
          console.log('Plans loaded:', plansData.length, 'plans');
          setPlans(Array.isArray(plansData) ? plansData : []);
        } else {
          console.error('Error fetching plans:', plansResponse.reason);
          toast.error('Failed to load subscription plans');
        }

        // Handle subscription response
        if (subscriptionResponse.status === 'fulfilled') {
          const subData = subscriptionResponse.value.data;
          console.log('Subscription status:', subData);
          if (subData?.hasSubscription && subData?.subscription) {
            console.log('Active subscription found, expires:', subData.subscription.expiryDate);
            setSubscription(subData.subscription);
          } else {
            console.log('No active subscription');
          }
        } else {
          console.log('Error checking subscription:', subscriptionResponse.reason);
        }
        
        setPageLoading(false);
      } catch (error) {
        console.error('Error loading subscription data:', error);
        if (isMounted) {
          toast.error('Failed to load subscription information');
          setPageLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubscribe = async (planType: string) => {
    setLoading(true);
    try {
      // Check if Razorpay key is configured
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      
      if (!razorpayKey || razorpayKey.includes('your_key_id')) {
        // Use test subscription for development
        toast.loading('Creating test subscription...');
        try {
          await api.post('/subscriptions/create-test', { planType });
          toast.dismiss();
          toast.success('Test subscription created successfully!');
          setTimeout(() => {
            router.push('/properties');
          }, 1000);
          return;
        } catch (error: any) {
          toast.dismiss();
          toast.error(error.response?.data?.message || 'Error creating test subscription');
          setLoading(false);
          return;
        }
      }

      // Create Razorpay order
      const response = await api.post('/subscriptions/create-order', {
        planType,
      });

      const { orderId, amount } = response.data;

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => openRazorpayCheckout(orderId, amount, planType, razorpayKey);
        script.onerror = () => {
          toast.error('Failed to load payment gateway. Please try again.');
          setLoading(false);
        };
        document.body.appendChild(script);
      } else {
        openRazorpayCheckout(orderId, amount, planType, razorpayKey);
      }
    } catch (error: any) {
      console.error('Subscribe error:', error);
      toast.error(error.response?.data?.message || 'Error creating order');
      setLoading(false);
    }
  };

  const openRazorpayCheckout = (orderId: string, amount: number, planType: string, razorpayKey: string) => {
    const options = {
      key: razorpayKey,
      amount: amount,
      currency: 'INR',
      name: 'Property Broker',
      description: `Subscribe to ${planType} plan`,
      order_id: orderId,
      handler: async function (response: any) {
        try {
          toast.loading('Verifying payment...');
          await api.post('/subscriptions/verify-payment', {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            planType,
          });
          toast.dismiss();
          toast.success('Subscription activated successfully!');
          setTimeout(() => {
            router.push('/properties');
          }, 1000);
        } catch (error: any) {
          toast.dismiss();
          toast.error(
            error.response?.data?.message || 'Payment verification failed'
          );
        }
      },
      prefill: {
        email: '',
        contact: '',
      },
      theme: {
        color: '#0ea5e9',
      },
      modal: {
        ondismiss: function() {
          setLoading(false);
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', function (response: any) {
      toast.error('Payment failed: ' + response.error.description);
      setLoading(false);
    });
    razorpay.open();
  };

  if (subscription) {
    // Check if admin
    if (subscription.isAdmin) {
      return (
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-4">Admin Access</h2>
                <div className="space-y-2">
                  <p className="text-lg">
                    You have <strong className="text-green-600">unlimited access</strong> as an administrator.
                  </p>
                  <p className="text-gray-600">
                    No subscription required for admin users.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/properties')}
                  className="mt-6 bg-sky-600 text-white px-6 py-2 rounded-md hover:bg-sky-700"
                >
                  Go to Properties
                </button>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      );
    }

    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-4">Active Subscription</h2>
              <div className="space-y-2">
                <p>
                  <strong>Plan:</strong> {subscription.planType}
                </p>
                <p>
                  <strong>Expires:</strong>{' '}
                  {new Date(subscription.expiryDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Days Remaining:</strong> {subscription.daysRemaining}
                </p>
              </div>
              <button
                onClick={() => router.push('/properties')}
                className="mt-6 bg-sky-600 text-white px-6 py-2 rounded-md hover:bg-sky-700"
              >
                Go to Properties
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">
            Choose Your Plan
          </h1>
          {(!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 
            process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes('your_key_id')) && (
            <div className="text-center mb-6">
              <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-4 py-2 rounded-full">
                🧪 Test Mode: Subscriptions will be created instantly without payment
              </span>
            </div>
          )}
          
          {pageLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 mb-4">No subscription plans available at the moment.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-sky-600 text-white px-6 py-2 rounded-md hover:bg-sky-700"
              >
                Refresh Page
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.type}
                  className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition"
                >
                  <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">₹{plan.price}</span>
                    <span className="text-gray-600">/{plan.duration}</span>
                  </div>
                  {plan.savings && (
                    <p className="text-green-600 font-semibold mb-4">
                      Save ₹{plan.savings}
                    </p>
                  )}
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan.type)}
                    disabled={loading}
                    className="w-full bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? 'Processing...' : 'Subscribe'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

