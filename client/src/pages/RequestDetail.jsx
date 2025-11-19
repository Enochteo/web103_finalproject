import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRequestDetails } from '../services/api';

const RequestDetail = () => {
  const { userId, requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequestDetails();
  }, [userId, requestId]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const data = await getRequestDetails(userId, requestId);
      setRequest(data);
      setError(null);
    } catch (err) {
      setError('Failed to load request details. Please try again.');
      console.error('Error fetching request details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MEDIUM':
        return 'bg-yellow-500 text-white';
      case 'LOW':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Request not found'}</p>
          <Link
            to={`/students/${userId}/requests`}
            className="text-blue-600 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Campus Maintenance</h1>
                <p className="text-sm text-gray-600">Request & Track System</p>
              </div>
            </div>
            <Link
              to={`/students/${userId}/requests`}
              className="px-4 py-2 bg-gray-600 text-white font-medium rounded hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Request Details Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Image */}
          {request.photo_url && (
            <div className="w-full h-64 bg-gray-200">
              <img
                src={request.photo_url}
                alt={request.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            {/* Title and Status */}
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-3xl font-bold text-gray-900">{request.title}</h2>
              <div className="flex gap-2">
                <span className={`px-3 py-1 text-sm font-semibold rounded border ${getUrgencyColor(request.urgency)}`}>
                  {request.urgency}
                </span>
                <span className={`px-3 py-1 text-sm font-semibold rounded border ${getStatusColor(request.status)}`}>
                  {request.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{request.description}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                <p className="text-gray-900">{request.location}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Submitted By</h4>
                <p className="text-gray-900">{request.user_name || 'Unknown'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Created At</h4>
                <p className="text-gray-900">{formatDate(request.created_at)}</p>
              </div>
              {request.assigned_to_name && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Assigned To</h4>
                  <p className="text-gray-900">{request.assigned_to_name}</p>
                </div>
              )}
            </div>

            {/* Categories */}
            {request.categories && request.categories.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {request.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Details */}
            {request.status === 'RESOLVED' && request.resolved_at && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolution Details</h3>
                {request.admin_notes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Admin Notes</h4>
                    <p className="text-gray-700">{request.admin_notes}</p>
                  </div>
                )}
                {request.resolution_photo_url && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Resolution Photo</h4>
                    <img
                      src={request.resolution_photo_url}
                      alt="Resolution"
                      className="w-full max-w-md rounded-lg"
                    />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Resolved At</h4>
                  <p className="text-gray-900">{formatDate(request.resolved_at)}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Link
                to={`/students/${userId}/requests/${requestId}/edit`}
                className="px-4 py-2 bg-gray-600 text-white font-medium rounded hover:bg-gray-700"
              >
                Edit Request
              </Link>
              <button
                onClick={() => navigate(`/students/${userId}/requests`)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;

