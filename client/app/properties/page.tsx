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
  sizeMin: z.string().optional(),
  sizeMax: z.string().optional(),
  sizeUnit: z.enum(['gaj', 'sqft', 'yd']).optional(),
  bedrooms: z.string().optional(),
  floors: z.string().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [nearbyProperties, setNearbyProperties] = useState<any[]>([]);
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
      const main = response.data.properties || [];
      const nearby = response.data.nearbyProperties || [];

      setProperties(main);
      setNearbyProperties(nearby);

      if (main.length === 0 && nearby.length === 0) {
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
            {/* Search Guidance */}
            <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm text-blue-700">
                💡 <strong>Quick Tip:</strong> Enter at least <strong>City/Area</strong> to search. All other fields are optional and help narrow down results.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Primary Filters - Recommended */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  📍 Location <span className="ml-2 text-xs font-normal text-green-600 bg-green-100 px-2 py-1 rounded">Recommended</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      {...register('city')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Delhi, Mumbai"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area <span className="text-xs text-blue-600">(up to 3 locations)</span>
                    </label>
                    <input
                      {...register('area')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Anand Lok, Vasant Vihar, Defence Colony"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      💡 Separate multiple areas with commas to search up to 3 locations at once
                    </p>
                  </div>
                </div>
              </div>

              {/* Secondary Filters - Optional */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  🏠 Property Details <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">Optional</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrooms (at least)
                    </label>
                    <select
                      {...register('bedrooms')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Any Bedrooms</option>
                      <option value="1">1+ BHK</option>
                      <option value="2">2+ BHK</option>
                      <option value="3">3+ BHK</option>
                      <option value="4">4+ BHK</option>
                      <option value="5">5+ BHK</option>
                      <option value="6">6+ BHK</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floor Preference
                    </label>
                    <select
                      {...register('floors')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Any Floor</option>
                      <option value="basement">Basement</option>
                      <option value="ground">Ground Floor</option>
                      <option value="first">First Floor</option>
                      <option value="second">Second Floor</option>
                      <option value="third">Third Floor</option>
                      <option value="terrace">Terrace</option>
                      <option value="stilt">Stilt</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Size & Budget Filters - Optional */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  📐 Size <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">Optional</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size Unit
                    </label>
                    <select
                      {...register('sizeUnit')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="sqft">Square Feet</option>
                      <option value="yd">Yards</option>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., 100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Size
                    </label>
                    <input
                      {...register('sizeMax')}
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., 500"
                    />
                  </div>
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
          ) : (
            <>
              {/* Primary Results */}
              {properties.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold mb-4">
                    Matching Properties
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <div
                        key={property._id}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                      >
                        <div className="mb-4">
                          <h3 className="text-xl font-semibold capitalize">
                            {property.location.area}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">
                            {property.location.city}
                          </p>
                          {property.propertyId && (
                            <p className="text-xs text-gray-400 mt-1">
                              ID: {property.propertyId}
                            </p>
                          )}
                          {property.uploadedAt && (
                            <p className="text-xs text-gray-400">
                              Listed: {new Date(property.uploadedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          {property.size && (
                            <p>
                              <strong>Size:</strong> {property.size.value}{' '}
                              {property.size.unit.toUpperCase()}
                            </p>
                          )}
                          {property.bedrooms && (
                            <p>
                              <strong>Bedrooms:</strong> {property.bedrooms} BHK
                            </p>
                          )}
                          {property.floors && property.floors.length > 0 && (
                            <p>
                              <strong>Floors:</strong>{' '}
                              {property.floors
                                .map((f: string) => f.charAt(0).toUpperCase() + f.slice(1))
                                .join(', ')}
                            </p>
                          )}
                          {property.detail && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm text-gray-600">
                                <strong className="text-gray-700">Details:</strong> {property.detail}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nearby / Similar Properties */}
              {nearbyProperties.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-2 flex items-center">
                    Similar Nearby Properties
                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Based on nearby locations & similar size/budget
                    </span>
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    These properties are from nearby areas in the same city and have similar size and budget to your search.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nearbyProperties.map((property) => (
                      <div
                        key={property._id}
                        className="bg-white rounded-lg shadow-sm border p-5 hover:shadow-md transition"
                      >
                        <div className="mb-3">
                          <h3 className="text-lg font-semibold capitalize">
                            {property.location.area}
                          </h3>
                          <p className="text-xs text-gray-500 capitalize">
                            {property.location.city}
                          </p>
                        </div>
                        <div className="space-y-1 text-sm">
                          {property.size && (
                            <p>
                              <strong>Size:</strong> {property.size.value}{' '}
                              {property.size.unit.toUpperCase()}
                            </p>
                          )}
                          {property.bedrooms && (
                            <p>
                              <strong>Bedrooms:</strong> {property.bedrooms} BHK
                            </p>
                          )}
                          {property.detail && (
                            <p className="text-xs text-gray-600 mt-2">
                              {property.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {properties.length === 0 && nearbyProperties.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <p className="text-gray-600">
                    No properties found. Try adjusting your search criteria.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

