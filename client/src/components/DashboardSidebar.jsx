import React from 'react';
import { LogOut } from 'lucide-react';

const DashboardSidebar = ({ 
  userDetails, 
  options, 
  activeTab, 
  onTabChange, 
  userRole, 
  userCode,
  onLogout
}) => {
  return (
    <aside className="w-72 bg-white shadow-sm border-r border-gray-200 flex-shrink-0 flex flex-col h-screen">
      {/* User Info Header */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <div className="w-5 h-5 text-blue-600">
              {userDetails?.icon}
            </div>
          </div>
          <div className="min-w-0 flex-1"> {/* Add min-w-0 to enable truncation */}
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {userDetails?.name || 'Loading...'}
            </h3>
            <p className="text-xs text-blue-600 font-medium truncate">
              {userCode || 'Loading...'}
            </p>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {userRole}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1.5">
          {options.map(option => {
            const Icon = option.icon;
            const isActive = activeTab === option.key;
            return (
              <button
                key={option.key}
                onClick={() => onTabChange(option.key)}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0 mr-2.5" />
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 mr-2.5" />
          <span className="truncate">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;