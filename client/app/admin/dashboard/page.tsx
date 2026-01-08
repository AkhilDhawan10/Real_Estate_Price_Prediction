'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { logout } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [searchStats, setSearchStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchDays, setSearchDays] = useState(30);

  useEffect(() => {
    fetchDashboardData();
    fetchSearchStatistics();
  }, []);

  useEffect(() => {
    fetchSearchStatistics();
  }, [searchDays]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/admin/dashboard/stats');
      setStats(statsRes.data.stats);
    } catch (error) {
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchStatistics = async () => {
    try {
      const response = await api.get(`/admin/search-statistics?days=${searchDays}`);
      setSearchStats(response.data);
    } catch (error) {
      console.error('Error fetching search statistics:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await api.post('/admin/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(
        `PDF processed: ${response.data.saved} properties saved, ${response.data.errors} errors`
      );
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error uploading PDF');
    } finally {
      setUploading(false);
    }
  };

  const downloadReport = async (type: 'users' | 'subscriptions' | 'search-statistics') => {
    try {
      const url = type === 'search-statistics' 
        ? `/admin/reports/${type}?days=${searchDays}`
        : `/admin/reports/${type}`;
      
      const response = await api.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${type}-report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Error downloading report');
    }
  };

  const handleDeleteAllProperties = async () => {
    if (!confirm('⚠️ Are you sure you want to delete ALL properties? This cannot be undone!')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await api.delete('/admin/properties');
      toast.success(`Deleted ${response.data.deletedCount} properties`);
      fetchDashboardData(); // Refresh stats
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting properties');
    } finally {
      setDeleting(false);
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
    <ProtectedRoute requireSubscription={false}>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-primary-600">
                Admin Dashboard
              </h1>
              <button
                onClick={logout}
                className="text-gray-700 hover:text-primary-600"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium">Total Users</h3>
              <p className="text-3xl font-bold mt-2">{stats?.totalUsers || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium">
                Total Properties
              </h3>
              <p className="text-3xl font-bold mt-2">
                {stats?.totalProperties || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium">
                Active Subscriptions
              </h3>
              <p className="text-3xl font-bold mt-2">
                {stats?.activeSubscriptions || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium">
                Total Revenue
              </h3>
              <p className="text-3xl font-bold mt-2">
                ₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}
              </p>
            </div>
          </div>

          {/* PDF Upload */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Upload Property PDF</h2>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {uploading && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Upload monthly property data PDF. The system will extract and
              store property information automatically.
            </p>
            
            {/* Delete All Properties Button */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleDeleteAllProperties}
                disabled={deleting || stats?.totalProperties === 0}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : `🗑️ Delete All Properties (${stats?.totalProperties || 0})`}
              </button>
              <p className="text-sm text-gray-500 mt-2">
                This will permanently delete all properties from the database.
              </p>
            </div>
          </div>

          {/* Reports */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Download Reports</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => downloadReport('users')}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
              >
                Download Users Report
              </button>
              <button
                onClick={() => downloadReport('subscriptions')}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
              >
                Download Subscriptions Report
              </button>
            </div>
          </div>

          {/* Search Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Most Searched Areas in Delhi</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={searchDays}
                  onChange={(e) => setSearchDays(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value={7}>Last 7 Days</option>
                  <option value={30}>Last 30 Days</option>
                  <option value={90}>Last 90 Days</option>
                  <option value={365}>Last Year</option>
                </select>
                <button
                  onClick={() => downloadReport('search-statistics')}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                >
                  📊 Download Excel
                </button>
              </div>
            </div>

            {searchStats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600">Total Searches</h3>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {searchStats.summary?.totalSearches || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600">Period</h3>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
                      {searchStats.summary?.periodDays || 0} Days
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600">Areas Searched</h3>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {searchStats.statistics?.length || 0}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Area/Locality
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total Searches
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Unique Users
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Avg Results
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Last Searched
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {searchStats.statistics?.slice(0, 15).map((stat: any, index: number) => (
                        <tr key={`${stat.area}-${index}`} className={index < 3 ? 'bg-yellow-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            {index < 3 ? `🏆 ${index + 1}` : index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                            {stat.area}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="font-semibold text-blue-600">{stat.searchCount}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stat.uniqueUsersCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stat.avgResultsCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(stat.lastSearchedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {searchStats.statistics?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No search data available for the selected period.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

