'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/auth';

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

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        if (!isAuthenticated()) {
          router.push('/login');
          if (isMounted) setLoading(false);
          return;
        }

        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          if (isMounted) setLoading(false);
          return;
        }

        if (!isMounted) return;

        setUser(currentUser);

        if (requireSubscription && currentUser.role !== 'admin') {
          // Check subscription status
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/subscriptions/status`,
              {
                headers: {
                  Authorization: `Bearer ${document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('token='))
                    ?.split('=')[1] || ''}`,
                },
              }
            );

            if (!response.ok) {
              router.push('/subscription');
              if (isMounted) setLoading(false);
              return;
            }
          } catch (error) {
            console.error('Subscription check error:', error);
            router.push('/subscription');
            if (isMounted) setLoading(false);
            return;
          }
        }

        if (isMounted) setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        if (isMounted) {
          setLoading(false);
          router.push('/login');
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router, requireSubscription]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}

