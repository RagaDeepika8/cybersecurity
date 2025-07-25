import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import PolicyBuilder from './components/PolicyBuilder';
import NetworkTopology from './components/NetworkTopology';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Dashboard Components
const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [policies, setPolicies] = useState([]);
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPolicyBuilder, setShowPolicyBuilder] = useState(false);
  const [showNetworkTopology, setShowNetworkTopology] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, policiesRes, devicesRes, alertsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/policies`),
        axios.get(`${API}/network/devices`),
        axios.get(`${API}/alerts`)
      ]);

      setStats(statsRes.data);
      setPolicies(policiesRes.data);
      setDevices(devicesRes.data);
      setAlerts(alertsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await axios.put(`${API}/alerts/${alertId}/resolve`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handlePolicyCreated = (newPolicy) => {
    setPolicies(prev => [...prev, newPolicy]);
    fetchDashboardData(); // Refresh stats
  };

  const togglePolicyStatus = async (policyId, currentStatus) => {
    try {
      await axios.put(`${API}/policies/${policyId}`, { enabled: !currentStatus });
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating policy status:', error);
    }
  };

  const deletePolicy = async (policyId) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await axios.delete(`${API}/policies/${policyId}`);
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting policy:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <div className="text-white text-xl mt-4">Loading Security Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🛡️</span>
            </div>
            <h1 className="text-xl font-bold text-white">Campus Web Access Security System</h1>
          </div>
          <div className="text-sm text-slate-400">
            Cisco Virtual Internship | {new Date().toLocaleDateString()}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-900 to-slate-900 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">
                Network Security Dashboard
              </h2>
              <p className="text-indigo-200 text-lg mb-6">
                Comprehensive web filtering and threat protection for campus networks
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowPolicyBuilder(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  Create Policy
                </button>
                <button 
                  onClick={() => setShowNetworkTopology(true)}
                  className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  Network Topology
                </button>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <img 
                src="https://images.unsplash.com/photo-1675627453084-505806a00406?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHxjeWJlcnNlY3VyaXR5JTIwZGFzaGJvYXJkfGVufDB8fHx8MTc1MzQ0NTE2Mnww&ixlib=rb-4.1.0&q=85"
                alt="Cybersecurity Dashboard"
                className="w-full h-48 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-indigo-500 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Policies</p>
                  <p className="text-2xl font-bold text-white">{stats.active_policies}</p>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">📋</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-indigo-500 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Network Devices</p>
                  <p className="text-2xl font-bold text-white">{stats.active_devices}</p>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🌐</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-indigo-500 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Blocked Requests</p>
                  <p className="text-2xl font-bold text-white">{stats.blocked_requests_today}</p>
                </div>
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🚫</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-indigo-500 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Unresolved Alerts</p>
                  <p className="text-2xl font-bold text-white">{stats.unresolved_alerts}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">⚠️</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Security Alerts</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-400">Live Monitoring</span>
              </div>
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'high' ? 'bg-orange-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <p className="text-white font-medium">{alert.title}</p>
                      <p className="text-slate-400 text-sm">{alert.source_ip} → {alert.destination}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      alert.resolved ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                    }`}>
                      {alert.resolved ? 'Resolved' : 'Active'}
                    </span>
                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 text-xs rounded transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Management */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Web Filtering Policies</h3>
              <button
                onClick={() => setShowPolicyBuilder(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + Create Policy
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policies.map((policy) => (
                <div key={policy.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{policy.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        policy.action === 'allow' ? 'bg-green-600 text-white' :
                        policy.action === 'block' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'
                      }`}>
                        {policy.action.toUpperCase()}
                      </span>
                      <button
                        onClick={() => togglePolicyStatus(policy.id, policy.enabled)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          policy.enabled ? 'bg-green-600 text-white' : 'bg-slate-600 text-slate-400'
                        }`}
                      >
                        {policy.enabled ? '✓' : '○'}
                      </button>
                      <button
                        onClick={() => deletePolicy(policy.id)}
                        className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs hover:bg-red-700 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{policy.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-indigo-300 text-xs">
                      {policy.category.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 text-xs">
                      {policy.domains.length} domains
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 text-xs">
                      Priority {policy.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPolicyBuilder && (
        <PolicyBuilder
          onClose={() => setShowPolicyBuilder(false)}
          onSave={handlePolicyCreated}
        />
      )}

      {showNetworkTopology && (
        <NetworkTopology
          onClose={() => setShowNetworkTopology(false)}
        />
      )}
    </div>
  );
};

// Main App Component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;