import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PolicyBuilder = ({ onClose, onSave }) => {
  const [policyData, setPolicyData] = useState({
    name: '',
    description: '',
    category: 'social_media',
    action: 'block',
    domains: [],
    keywords: [],
    enabled: true,
    priority: 1
  });

  const [domainInput, setDomainInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'social_media', label: 'Social Media', icon: '📱' },
    { value: 'streaming', label: 'Streaming', icon: '🎬' },
    { value: 'gaming', label: 'Gaming', icon: '🎮' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'research', label: 'Research', icon: '🔬' },
    { value: 'malware', label: 'Malware', icon: '🦠' },
    { value: 'adult_content', label: 'Adult Content', icon: '🔞' },
    { value: 'custom', label: 'Custom', icon: '⚙️' }
  ];

  const actions = [
    { value: 'block', label: 'Block', color: 'bg-red-600', icon: '🚫' },
    { value: 'allow', label: 'Allow', color: 'bg-green-600', icon: '✅' },
    { value: 'warn', label: 'Warn', color: 'bg-yellow-600', icon: '⚠️' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/policies`, policyData);
      onSave(response.data);
      onClose();
    } catch (error) {
      console.error('Error creating policy:', error);
      alert('Error creating policy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addDomain = () => {
    if (domainInput.trim() && !policyData.domains.includes(domainInput.trim())) {
      setPolicyData(prev => ({
        ...prev,
        domains: [...prev.domains, domainInput.trim()]
      }));
      setDomainInput('');
    }
  };

  const removeDomain = (domain) => {
    setPolicyData(prev => ({
      ...prev,
      domains: prev.domains.filter(d => d !== domain)
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !policyData.keywords.includes(keywordInput.trim())) {
      setPolicyData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setPolicyData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const selectedCategory = categories.find(c => c.value === policyData.category);
  const selectedAction = actions.find(a => a.value === policyData.action);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create Web Filtering Policy</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Policy Name
                </label>
                <input
                  type="text"
                  value={policyData.name}
                  onChange={(e) => setPolicyData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter policy name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Priority
                </label>
                <select
                  value={policyData.priority}
                  onChange={(e) => setPolicyData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={1}>1 (Highest)</option>
                  <option value={2}>2 (High)</option>
                  <option value={3}>3 (Medium)</option>
                  <option value={4}>4 (Low)</option>
                  <option value={5}>5 (Lowest)</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={policyData.description}
                onChange={(e) => setPolicyData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
                placeholder="Describe the purpose of this policy"
                required
              />
            </div>
          </div>

          {/* Category and Action */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Category & Action</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setPolicyData(prev => ({ ...prev, category: category.value }))}
                      className={`p-3 rounded-md border transition-colors ${
                        policyData.category === category.value
                          ? 'border-indigo-500 bg-indigo-600 text-white'
                          : 'border-slate-500 bg-slate-600 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{category.icon}</div>
                        <div className="text-xs">{category.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Action
                </label>
                <div className="space-y-2">
                  {actions.map((action) => (
                    <button
                      key={action.value}
                      type="button"
                      onClick={() => setPolicyData(prev => ({ ...prev, action: action.value }))}
                      className={`w-full p-3 rounded-md border transition-colors flex items-center justify-center space-x-2 ${
                        policyData.action === action.value
                          ? `border-${action.color.split('-')[1]}-500 ${action.color} text-white`
                          : 'border-slate-500 bg-slate-600 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <span className="text-lg">{action.icon}</span>
                      <span className="font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Domains */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Target Domains</h3>
            
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDomain())}
                className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter domain (e.g., facebook.com)"
              />
              <button
                type="button"
                onClick={addDomain}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {policyData.domains.map((domain) => (
                <span
                  key={domain}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-600 text-white"
                >
                  {domain}
                  <button
                    type="button"
                    onClick={() => removeDomain(domain)}
                    className="ml-2 text-indigo-200 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Keywords</h3>
            
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter keyword (e.g., gaming, social)"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {policyData.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-600 text-white"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="ml-2 text-yellow-200 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Policy Status */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Policy Status</h3>
                <p className="text-sm text-slate-400">Enable this policy to start filtering</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={policyData.enabled}
                  onChange={(e) => setPolicyData(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PolicyBuilder;