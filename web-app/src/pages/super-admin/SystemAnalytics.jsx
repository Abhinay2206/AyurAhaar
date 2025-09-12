import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../components';
import './SystemAnalytics.css';

const SystemAnalytics = () => {
  const [analytics, setAnalytics] = useState({});
  const [timeRange, setTimeRange] = useState('last_30_days');
  const [selectedMetric, setSelectedMetric] = useState('consultations');

  useEffect(() => {
    // Mock analytics data
    const mockAnalytics = {
      overview: {
        totalRevenue: 2450000,
        totalConsultations: 1847,
        activeUsers: 234,
        growthRate: 18.5,
        avgSessionDuration: '14m 32s',
        conversionRate: 12.8
      },
      consultations: {
        daily: [45, 52, 38, 61, 47, 55, 43, 58, 62, 49, 56, 51, 59, 48, 53, 46, 64, 52, 47, 55, 41, 58, 53, 49, 57, 44, 60, 48, 52, 56],
        byPrakriti: {
          vata: 642,
          pitta: 789,
          kapha: 416
        },
        successRate: 87.3,
        averageDuration: 42,
        followUpRate: 68.2
      },
      doctors: {
        performance: [
          { name: 'Dr. Priya Sharma', consultations: 324, rating: 4.8, revenue: 486000 },
          { name: 'Dr. Amit Patel', consultations: 298, rating: 4.9, revenue: 447000 },
          { name: 'Dr. Sunita Reddy', consultations: 267, rating: 4.6, revenue: 400500 },
          { name: 'Dr. Rajesh Kumar', consultations: 241, rating: 4.4, revenue: 361500 }
        ],
        totalActive: 15,
        averageRating: 4.7,
        retentionRate: 92.3
      },
      patients: {
        demographics: {
          ageGroups: {
            '18-30': 278,
            '31-45': 445,
            '46-60': 387,
            '60+': 156
          },
          genderDistribution: {
            male: 612,
            female: 654
          },
          locations: {
            'Mumbai': 234,
            'Delhi': 189,
            'Bangalore': 167,
            'Chennai': 145,
            'Others': 531
          }
        },
        healthConditions: {
          'Diabetes': 156,
          'Hypertension': 134,
          'PCOD': 89,
          'Obesity': 167,
          'Digestive Issues': 203,
          'Stress/Anxiety': 178,
          'Healthy': 339
        },
        satisfactionScore: 4.6,
        retentionRate: 78.9
      },
      mealPlans: {
        totalGenerated: 1456,
        averageCompliance: 74.3,
        effectivenessRates: {
          excellent: 423,
          good: 589,
          fair: 312,
          poor: 132
        },
        popularFoods: [
          'Quinoa Sprouts',
          'Wheat Dalia', 
          'Sprouted Moong',
          'Ghee',
          'Medicinal Bitter Gourd'
        ]
      },
      technical: {
        serverUptime: 99.8,
        averageResponseTime: 145,
        errorRate: 0.2,
        apiCalls: 145623,
        dataTransfer: '2.3TB',
        activeConnections: 124
      }
    };

    setAnalytics(mockAnalytics);
  }, [timeRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const MetricCard = ({ title, value, change, icon, color, subtitle }) => (
    <Card className={`metric-card ${color}`}>
      <div className="metric-content">
        <div className="metric-icon">{icon}</div>
        <div className="metric-info">
          <h3>{value}</h3>
          <p>{title}</p>
          {subtitle && <span className="metric-subtitle">{subtitle}</span>}
          {change && (
            <span className={`metric-change ${change > 0 ? 'positive' : 'negative'}`}>
              {change > 0 ? '↗' : '↘'} {Math.abs(change)}%
            </span>
          )}
        </div>
      </div>
    </Card>
  );

  const ChartContainer = ({ title, children, actions }) => (
    <Card className="chart-container">
      <div className="chart-header">
        <h3>{title}</h3>
        {actions && <div className="chart-actions">{actions}</div>}
      </div>
      <div className="chart-content">
        {children}
      </div>
    </Card>
  );

  const BarChart = ({ data, color = '#3b82f6', height = 200 }) => (
    <div className="bar-chart" style={{ height }}>
      {data.map((value, index) => (
        <div
          key={index}
          className="bar"
          style={{
            height: `${(value / Math.max(...data)) * 100}%`,
            backgroundColor: color
          }}
          title={`Day ${index + 1}: ${value}`}
        />
      ))}
    </div>
  );

  const DonutChart = ({ data, colors }) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    let cumulativePercentage = 0;

    return (
      <div className="donut-chart">
        <svg viewBox="0 0 200 200" className="donut-svg">
          {Object.entries(data).map(([key, value], index) => {
            const percentage = (value / total) * 100;
            const strokeDasharray = `${percentage * 2.51} ${251 - percentage * 2.51}`;
            const strokeDashoffset = -(cumulativePercentage * 2.51);
            cumulativePercentage += percentage;

            return (
              <circle
                key={key}
                cx="100"
                cy="100"
                r="40"
                fill="none"
                stroke={colors[index] || '#3b82f6'}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="donut-segment"
              />
            );
          })}
        </svg>
        <div className="donut-legend">
          {Object.entries(data).map(([key, value], index) => (
            <div key={key} className="legend-item">
              <span 
                className="legend-color"
                style={{ backgroundColor: colors[index] || '#3b82f6' }}
              />
              <span className="legend-label">{key}</span>
              <span className="legend-value">{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="system-analytics">
      <div className="page-header">
        <div className="header-content">
          <h1>📊 System Analytics</h1>
          <p>Comprehensive platform performance and insights</p>
        </div>
        <div className="header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="last_7_days">Last 7 days</option>
            <option value="last_30_days">Last 30 days</option>
            <option value="last_90_days">Last 90 days</option>
            <option value="last_year">Last year</option>
          </select>
          <Button variant="outline">📄 Export Report</Button>
          <Button variant="primary">📧 Schedule Report</Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="overview-metrics">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(analytics.overview?.totalRevenue)}
          change={18.5}
          icon="💰"
          color="green"
          subtitle="This month"
        />
        <MetricCard
          title="Total Consultations"
          value={formatNumber(analytics.overview?.totalConsultations)}
          change={12.3}
          icon="🩺"
          color="blue"
          subtitle="This month"
        />
        <MetricCard
          title="Active Users"
          value={analytics.overview?.activeUsers}
          change={8.7}
          icon="👥"
          color="purple"
          subtitle="Currently online"
        />
        <MetricCard
          title="Growth Rate"
          value={`${analytics.overview?.growthRate}%`}
          change={2.1}
          icon="📈"
          color="orange"
          subtitle="Month over month"
        />
      </div>

      {/* Main Charts Row */}
      <div className="charts-row">
        <ChartContainer 
          title="Daily Consultations (Last 30 Days)"
          actions={
            <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
              <option value="consultations">Consultations</option>
              <option value="revenue">Revenue</option>
              <option value="patients">New Patients</option>
            </select>
          }
        >
          <BarChart 
            data={analytics.consultations?.daily || []} 
            color="#3b82f6"
            height={250}
          />
          <div className="chart-stats">
            <div className="stat-item">
              <span className="stat-label">Average Daily</span>
              <span className="stat-value">52.3</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Peak Day</span>
              <span className="stat-value">64</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Growth</span>
              <span className="stat-value positive">+12.5%</span>
            </div>
          </div>
        </ChartContainer>

        <ChartContainer title="Consultations by Prakriti">
          <DonutChart
            data={analytics.consultations?.byPrakriti || {}}
            colors={['#8b5cf6', '#f59e0b', '#10b981']}
          />
        </ChartContainer>
      </div>

      {/* Doctor Performance */}
      <ChartContainer title="Top Performing Doctors">
        <div className="doctor-performance">
          <div className="performance-table">
            <div className="table-header">
              <span>Doctor</span>
              <span>Consultations</span>
              <span>Rating</span>
              <span>Revenue</span>
              <span>Performance</span>
            </div>
            {analytics.doctors?.performance.map((doctor, index) => (
              <div key={index} className="table-row">
                <div className="doctor-info">
                  <span className="doctor-name">{doctor.name}</span>
                  <span className="doctor-rank">#{index + 1}</span>
                </div>
                <span className="consultations">{doctor.consultations}</span>
                <div className="rating">
                  <span className="rating-value">{doctor.rating}</span>
                  <div className="stars">
                    {'★'.repeat(Math.floor(doctor.rating))}
                  </div>
                </div>
                <span className="revenue">{formatCurrency(doctor.revenue)}</span>
                <div className="performance-bar">
                  <div 
                    className="performance-fill"
                    style={{ 
                      width: `${(doctor.consultations / 350) * 100}%`,
                      backgroundColor: index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : '#f59e0b'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </ChartContainer>

      {/* Patient Demographics */}
      <div className="demographics-row">
        <ChartContainer title="Age Distribution">
          <BarChart
            data={Object.values(analytics.patients?.demographics?.ageGroups || {})}
            color="#10b981"
            height={200}
          />
          <div className="age-labels">
            {Object.keys(analytics.patients?.demographics?.ageGroups || {}).map(age => (
              <span key={age} className="age-label">{age}</span>
            ))}
          </div>
        </ChartContainer>

        <ChartContainer title="Health Conditions">
          <div className="health-conditions">
            {Object.entries(analytics.patients?.healthConditions || {}).map(([condition, count]) => (
              <div key={condition} className="condition-item">
                <div className="condition-info">
                  <span className="condition-name">{condition}</span>
                  <span className="condition-count">{count}</span>
                </div>
                <div className="condition-bar">
                  <div 
                    className="condition-fill"
                    style={{ 
                      width: `${(count / 339) * 100}%`,
                      backgroundColor: condition === 'Healthy' ? '#10b981' : '#f59e0b'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>

        <ChartContainer title="Meal Plan Effectiveness">
          <DonutChart
            data={analytics.mealPlans?.effectivenessRates || {}}
            colors={['#10b981', '#3b82f6', '#f59e0b', '#ef4444']}
          />
          <div className="effectiveness-stats">
            <div className="stat">
              <span className="label">Avg. Compliance</span>
              <span className="value">{analytics.mealPlans?.averageCompliance}%</span>
            </div>
            <div className="stat">
              <span className="label">Total Plans</span>
              <span className="value">{analytics.mealPlans?.totalGenerated}</span>
            </div>
          </div>
        </ChartContainer>
      </div>

      {/* Technical Metrics */}
      <ChartContainer title="Technical Performance">
        <div className="technical-metrics">
          <div className="tech-grid">
            <div className="tech-metric">
              <h4>Server Uptime</h4>
              <div className="tech-value good">{analytics.technical?.serverUptime}%</div>
              <div className="tech-trend positive">↗ 0.1%</div>
            </div>
            <div className="tech-metric">
              <h4>Response Time</h4>
              <div className="tech-value">{analytics.technical?.averageResponseTime}ms</div>
              <div className="tech-trend positive">↘ 12ms</div>
            </div>
            <div className="tech-metric">
              <h4>Error Rate</h4>
              <div className="tech-value good">{analytics.technical?.errorRate}%</div>
              <div className="tech-trend positive">↘ 0.1%</div>
            </div>
            <div className="tech-metric">
              <h4>API Calls</h4>
              <div className="tech-value">{formatNumber(analytics.technical?.apiCalls)}</div>
              <div className="tech-trend positive">↗ 8.5%</div>
            </div>
            <div className="tech-metric">
              <h4>Data Transfer</h4>
              <div className="tech-value">{analytics.technical?.dataTransfer}</div>
              <div className="tech-trend neutral">→ 0%</div>
            </div>
            <div className="tech-metric">
              <h4>Active Connections</h4>
              <div className="tech-value">{analytics.technical?.activeConnections}</div>
              <div className="tech-trend positive">↗ 12</div>
            </div>
          </div>
        </div>
      </ChartContainer>
    </div>
  );
};

export default SystemAnalytics;
