import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NetworkTopology = ({ onClose }) => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await axios.get(`${API}/network/devices`);
      setDevices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setLoading(false);
    }
  };

  const deviceIcons = {
    router: '🌐',
    firewall: '🔥',
    switch: '🔀',
    utm: '🛡️',
    student_device: '💻',
    server: '🖥️'
  };

  const deviceColors = {
    router: 'bg-blue-600',
    firewall: 'bg-red-600',
    switch: 'bg-green-600',
    utm: 'bg-purple-600',
    student_device: 'bg-yellow-600',
    server: 'bg-indigo-600'
  };

  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-red-500',
    warning: 'bg-yellow-500'
  };

  const NetworkDevice = ({ device, isSelected, onClick }) => (
    <div
      className={`relative cursor-pointer transition-all duration-300 ${
        isSelected ? 'scale-110' : 'hover:scale-105'
      }`}
      onClick={() => onClick(device)}
      style={{
        left: `${device.position.x}px`,
        top: `${device.position.y}px`,
        position: 'absolute'
      }}
    >
      <div className={`w-16 h-16 rounded-xl ${deviceColors[device.device_type]} flex items-center justify-center shadow-lg border-2 ${
        isSelected ? 'border-white' : 'border-slate-600'
      }`}>
        <span className="text-2xl">{deviceIcons[device.device_type]}</span>
      </div>
      
      {/* Status indicator */}
      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${statusColors[device.status]} border-2 border-slate-800`}></div>
      
      {/* Device name */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white font-medium whitespace-nowrap">
        {device.name}
      </div>
      
      {/* IP Address */}
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap">
        {device.ip_address}
      </div>
    </div>
  );

  const ConnectionLine = ({ from, to }) => {
    const fromDevice = devices.find(d => d.id === from || d.name.toLowerCase().replace(' ', '-') === from);
    const toDevice = devices.find(d => d.id === to || d.name.toLowerCase().replace(' ', '-') === to);
    
    if (!fromDevice || !toDevice) return null;

    const x1 = fromDevice.position.x + 32; // Center of device (32px = half of 64px width)
    const y1 = fromDevice.position.y + 32;
    const x2 = toDevice.position.x + 32;
    const y2 = toDevice.position.y + 32;

    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#4f46e5"
        strokeWidth="3"
        strokeDasharray="8,4"
        className="animate-pulse"
      />
    );
  };

  const DeviceDetails = ({ device }) => (
    <div className="bg-slate-700 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="text-2xl mr-2">{deviceIcons[device.device_type]}</span>
          {device.name}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs ${
          device.status === 'active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {device.status.toUpperCase()}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-400">Type</p>
          <p className="text-white font-medium">{device.device_type.replace('_', ' ').toUpperCase()}</p>
        </div>
        <div>
          <p className="text-slate-400">IP Address</p>
          <p className="text-white font-medium">{device.ip_address}</p>
        </div>
        <div>
          <p className="text-slate-400">Location</p>
          <p className="text-white font-medium">{device.location}</p>
        </div>
        <div>
          <p className="text-slate-400">Connections</p>
          <p className="text-white font-medium">{device.connections.length}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-slate-400 text-sm">Description</p>
        <p className="text-white">{device.description}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-8">
          <div className="text-white text-xl">Loading Network Topology...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Network Topology</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Network Diagram */}
          <div className="lg:col-span-2">
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Campus Network Infrastructure</h3>
              
              <div className="relative bg-slate-900 rounded-lg p-8 min-h-[400px]">
                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full">
                  {devices.map((device) =>
                    device.connections.map((connection) => (
                      <ConnectionLine
                        key={`${device.id}-${connection}`}
                        from={device.id}
                        to={connection}
                      />
                    ))
                  )}
                </svg>

                {/* Network devices */}
                {devices.map((device) => (
                  <NetworkDevice
                    key={device.id}
                    device={device}
                    isSelected={selectedDevice?.id === device.id}
                    onClick={setSelectedDevice}
                  />
                ))}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-slate-800 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-white mb-2">Legend</h4>
                  <div className="space-y-1">
                    {Object.entries(deviceIcons).map(([type, icon]) => (
                      <div key={type} className="flex items-center text-xs text-slate-300">
                        <span className="mr-2">{icon}</span>
                        <span>{type.replace('_', ' ').toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data flow indicator */}
                <div className="absolute bottom-4 right-4 bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center text-xs text-slate-300">
                    <div className="w-4 h-1 bg-indigo-500 mr-2 animate-pulse"></div>
                    <span>Data Flow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div className="lg:col-span-1">
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Device Information</h3>
              
              {selectedDevice ? (
                <DeviceDetails device={selectedDevice} />
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🖱️</div>
                  <p className="text-slate-400">Click on a device to view details</p>
                </div>
              )}
            </div>

            {/* Network Statistics */}
            <div className="bg-slate-700 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-semibold text-white mb-4">Network Statistics</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Devices</span>
                  <span className="text-white font-medium">{devices.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Devices</span>
                  <span className="text-green-400 font-medium">
                    {devices.filter(d => d.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Security Appliances</span>
                  <span className="text-purple-400 font-medium">
                    {devices.filter(d => d.device_type === 'utm' || d.device_type === 'firewall').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Network Segments</span>
                  <span className="text-blue-400 font-medium">3</span>
                </div>
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-slate-700 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-semibold text-white mb-4">Security Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">UTM Protection</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Web Filtering</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-400 text-sm">Enabled</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Threat Detection</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-yellow-400 text-sm">Monitoring</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Bandwidth Control</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-400 text-sm">Optimized</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTopology;