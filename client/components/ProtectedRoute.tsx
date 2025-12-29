'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/auth';
import api from '@/lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export default function ProtectedRoute({
  children,
  requireSubscription = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // First check if we have a token
        if (!isAuthenticated()) {
          console.log('No authentication token found');
          if (isMounted) {
            setLoading(false);
            router.replace('/login');
          }
          return;
        }

        // Get current user
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          console.log('Could not fetch user details');
          if (isMounted) {
            setLoading(false);
            router.replace('/login');
          }
          return;
        }

        if (!isMounted) return;

        setUser(currentUser);
        console.log('User authenticated:', currentUser.email, 'Role:', currentUser.role);

        // Check subscription if required
        if (requireSubscription && currentUser.role !== 'admin') {
          try {
            const response = await api.get('/subscriptions/status');
            const hasSubscription = response.data?.hasSubscription;
            
            if (!hasSubscription) {
              console.log('No active subscription found');
              if (isMounted) {
                setLoading(false);
                router.replace('/subscription');
              }
              return;
            }
            console.log('Active subscription verified');
          } catch (error: any) {
            console.error('Subscription check error:', error.response?.status);
            if (isMounted) {
              setLoading(false);
              router.replace('/subscription');
            }
            return;
          }
        }

        if (isMounted) {
          setAuthChecked(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (isMounted) {
          setLoading(false);
          router.replace('/login');
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router, requireSubscription]);

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

