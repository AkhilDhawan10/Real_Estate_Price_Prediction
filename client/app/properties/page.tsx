'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { logout } from '@/lib/auth';

const searchSchema = z.object({
  city: z.string().optional(),
  area: z.string().optional(),
  propertyType: z.enum(['plot', 'flat']).optional(),
  sizeMin: z.string().optional(),
  sizeMax: z.string().optional(),
  sizeUnit: z.enum(['gaj', 'sqft']).optional(),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  });

  const onSubmit = async (data: SearchFormData) => {
    setSearching(true);
    try {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/properties/search?${params.toString()}`);
      setProperties(response.data.properties);
      if (response.data.properties.length === 0) {
        // react-hot-toast does not expose `info` on newer versions — use a generic toast with an info icon
        toast('No properties found matching your criteria', { icon: 'ℹ️' });
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Active subscription required');
        router.push('/subscription');
      } else {
        toast.error('Error searching properties');
      }
    } finally {
      setSearching(false);
    }
  };

  return (
    <ProtectedRoute requireSubscription>
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
                  href="/profile"
                  className="text-gray-700 hover:text-primary-600"
                >
                  Profile
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-6">Search Properties</h1>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    {...register('city')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                    placeholder="Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area
                  </label>
                  <input
                    {...register('area')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                    placeholder="Bandra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type
                  </label>
                  <select
                    {...register('propertyType')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  >
                    <option value="">Any</option>
                    <option value="plot">Plot</option>
                    <option value="flat">Flat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size Unit
                  </label>
                  <select
                    {...register('sizeUnit')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  >
                    <option value="sqft">Square Feet</option>
                    <option value="gaj">Gaj</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Size
                  </label>
                  <input
                    {...register('sizeMin')}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Size
                  </label>
                  <input
                    {...register('sizeMax')}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                    placeholder="2000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Budget (₹)
                  </label>
                  <input
                    {...register('budgetMin')}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                    placeholder="5000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Budget (₹)
                  </label>
                  <input
                    {...register('budgetMax')}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                    placeholder="10000000"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={searching}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search Properties'}
              </button>
            </form>
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div
                  key={property._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold">
                      {property.location.city}, {property.location.area}
                    </h3>
                    <p className="text-gray-600 capitalize">
                      {property.propertyType}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p>
                      <strong>Size:</strong> {property.size.value}{' '}
                      {property.size.unit}
                    </p>
                    <p>
                      <strong>Price:</strong> ₹
                      {property.price.toLocaleString('en-IN')}
                    </p>
                    {property.brokerNotes && (
                      <p className="text-sm text-gray-600">
                        {property.brokerNotes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-600">
                No properties found. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

