'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { logout } from '@/lib/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, subsRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/users?limit=10'),
        api.get('/admin/subscriptions?limit=10&status=active'),
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setSubscriptions(subsRes.data.subscriptions);
    } catch (error) {
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
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

  const downloadReport = async (type: 'users' | 'subscriptions') => {
    try {
      const response = await api.get(`/admin/reports/${type}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Error downloading report');
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

          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Active Subscriptions</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Expires
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptions.map((sub) => (
                    <tr key={sub._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sub.user?.fullName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sub.planType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{sub.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sub.expiryDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

