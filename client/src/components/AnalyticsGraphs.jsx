import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

export default function AnalyticsGraphs({ userRole, duration }) {
  const [modelCounts, setModelCounts] = useState(null);
  const [salesTrends, setSalesTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch model counts
        const countsResponse = await axios.get('/api/analytics/model-counts', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { role: userRole, duration }
        });

        // Fetch sales trends
        const trendsResponse = await axios.get('/api/analytics/model-trends', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { role: userRole, duration }
        });

        setModelCounts(countsResponse.data.modelCounts);
        setSalesTrends(trendsResponse.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userRole, duration]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  const modelCountsData = {
    labels: Array.isArray(modelCounts) ? modelCounts.map(item => item.device_model_name) : [],
    datasets: [
      {
        label: 'Number of Invoices',
        data: Array.isArray(modelCounts) ? modelCounts.map(item => item.invoice_count) : [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)', // Blue color
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  // Transform trend data for line chart
  const trendData = {
    labels: Object.values(salesTrends || {})[0]?.map(item => 
      new Date(item.date).toLocaleDateString()
    ) || [],
    datasets: Object.entries(salesTrends || {}).map(([model, data], index) => ({
      label: model,
      data: data.map(item => item.sales),
      borderColor: `hsl(${index * 50}, 70%, 50%)`,
      tension: 0.4,
      fill: false,
    })).slice(0, 5), // Show only top 5 models for clarity
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Models by Number of Invoices
        </h3>
        <div className="h-[400px]">
          <Bar data={modelCountsData} options={chartOptions} />
        </div>
      </div>

      {/* Line Chart Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Model Sales Trends
        </h3>
        <div className="h-[400px]">
          <Line data={trendData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}