'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { logout } from '@/lib/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchSubscription();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.user);
    } catch (error) {
      toast.error('Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/status');
      if (response.data.hasSubscription) {
        setSubscription(response.data.subscription);
      }
    } catch (error) {
      // No subscription
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/properties" className="text-2xl font-bold text-primary-600">
                Property Broker
              </Link>
              <div className="flex items-center space-x-4">
                <Link
                  href="/properties"
                  className="text-gray-700 hover:text-primary-600"
                >
                  Properties
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-primary-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-6">Profile</h1>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="space-y-3">
              <div>
                <strong>Full Name:</strong> {user?.fullName}
              </div>
              <div>
                <strong>Email:</strong> {user?.email}
              </div>
              <div>
                <strong>Phone:</strong> {user?.phoneNumber}
              </div>
              <div>
                <strong>Member Since:</strong>{' '}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'N/A'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Subscription</h2>
            {subscription ? (
              <div className="space-y-3">
                <div>
                  <strong>Plan:</strong> {subscription.planType}
                </div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span
                    className={
                      subscription.isActive
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {subscription.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <strong>Expires:</strong>{' '}
                  {new Date(subscription.expiryDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Days Remaining:</strong> {subscription.daysRemaining}
                </div>
                {subscription.daysRemaining <= 7 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4">
                    <p className="text-yellow-800">
                      Your subscription expires soon. Please renew to continue
                      accessing properties.
                    </p>
                    <Link
                      href="/subscription"
                      className="text-primary-600 hover:underline mt-2 inline-block"
                    >
                      Renew Subscription
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  You don't have an active subscription.
                </p>
                <Link
                  href="/subscription"
                  className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 inline-block"
                >
                  Subscribe Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

