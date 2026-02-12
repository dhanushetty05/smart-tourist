import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, LogOut, Users, AlertTriangle, MapPin, TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import LiveMap from '@/components/custom/LiveMap';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [tourists, setTourists] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [geoZones, setGeoZones] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const [touristsRes, alertsRes, zonesRes, analyticsRes] = await Promise.all([
        axios.get(`${API_URL}/tourists`),
        axios.get(`${API_URL}/alerts`),
        axios.get(`${API_URL}/geo-zones`),
        axios.get(`${API_URL}/analytics/dashboard`)
      ]);
      
      // Handle response data formats
      const touristsData = touristsRes.data.data || touristsRes.data;
      const alertsData = alertsRes.data.data || alertsRes.data;
      const zonesData = zonesRes.data.data || zonesRes.data;
      const analyticsData = analyticsRes.data.data || analyticsRes.data;
      
      setTourists(Array.isArray(touristsData) ? touristsData : []);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setGeoZones(Array.isArray(zonesData) ? zonesData : []);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Set empty arrays on error
      setTourists([]);
      setAlerts([]);
      setGeoZones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAlert = async (alertId, status, assignedOfficer = null) => {
    try {
      await axios.patch(`${API_URL}/alerts/${alertId}?status=${status}${assignedOfficer ? `&assigned_officer=${assignedOfficer}` : ''}`);
      toast.success(`Alert ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update alert');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredTourists = tourists.filter(t => 
    (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.tourist_id || t.touristId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAlerts = alerts.filter(a => 
    (a.tourist_name || a.touristName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.tourist_id || a.touristId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const alertsPerDayData = analytics?.alerts_per_day ? 
    Object.entries(analytics.alerts_per_day).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      alerts: count
    })) : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-heading font-bold" data-testid="admin-dashboard-title">Command Center</h1>
              <p className="text-xs text-slate-400">{user?.role === 'police' ? 'Police' : 'Tourism'} Officer - {user?.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-300" data-testid="admin-logout-button">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {['overview', 'map', 'alerts', 'tourists', 'analytics'].map((view) => (
              <Button
                key={view}
                variant="ghost"
                size="sm"
                className={`capitalize ${selectedView === view ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                onClick={() => setSelectedView(view)}
                data-testid={`tab-${view}`}
              >
                {view}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Overview Tab */}
        {selectedView === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-slate-900 border-slate-800" data-testid="stat-total-tourists">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-sm">Active Tourists</p>
                      <p className="text-3xl font-bold mt-2">{analytics?.total_tourists || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800" data-testid="stat-active-alerts">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-sm">Active Alerts</p>
                      <p className="text-3xl font-bold mt-2 text-red-500">{analytics?.active_alerts || 0}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800" data-testid="stat-high-risk-zones">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-sm">High Risk Zones</p>
                      <p className="text-3xl font-bold mt-2 text-amber-500">{analytics?.high_risk_zones_count || 0}</p>
                    </div>
                    <MapPin className="w-8 h-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800" data-testid="stat-response-time">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-sm">Avg Response Time</p>
                      <p className="text-3xl font-bold mt-2 text-emerald-500">{analytics?.avg_response_time_minutes?.toFixed(1) || 0}m</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Alerts */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.slice(0, 5).length === 0 ? (
                  <p className="text-center text-slate-400 py-8">No active alerts</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400">Tourist</TableHead>
                        <TableHead className="text-slate-400">Type</TableHead>
                        <TableHead className="text-slate-400">Risk</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="text-slate-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.slice(0, 5).map((alert) => (
                        <TableRow key={alert.id} className="border-slate-800" data-testid={`alert-overview-${alert.id}`}>
                          <TableCell className="text-white">{alert.tourist_name}</TableCell>
                          <TableCell>
                            <Badge variant={alert.alert_type === 'panic' ? 'destructive' : 'default'}>
                              {alert.alert_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={alert.risk_score >= 80 ? 'text-red-500 font-semibold' : 'text-amber-500'}>
                              {alert.risk_score}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={alert.status === 'resolved' ? 'success' : 'secondary'}>
                              {alert.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {alert.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateAlert(alert.id, 'resolved', user?.name)}
                                data-testid={`resolve-alert-${alert.id}`}
                              >
                                Resolve
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Map Tab */}
        {selectedView === 'map' && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Live Monitoring Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] rounded-lg overflow-hidden">
                <LiveMap
                  center={[28.6139, 77.2090]}
                  zoom={12}
                  tourists={tourists}
                  alerts={alerts.filter(a => a.status === 'pending')}
                  geoZones={geoZones}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts Tab */}
        {selectedView === 'alerts' && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Alert Management</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 bg-slate-800 border-slate-700"
                    data-testid="search-alerts-input"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-400">Date</TableHead>
                      <TableHead className="text-slate-400">Tourist</TableHead>
                      <TableHead className="text-slate-400">ID</TableHead>
                      <TableHead className="text-slate-400">Type</TableHead>
                      <TableHead className="text-slate-400">Risk</TableHead>
                      <TableHead className="text-slate-400">Reason</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400">Officer</TableHead>
                      <TableHead className="text-slate-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlerts.map((alert) => (
                      <TableRow key={alert.id} className="border-slate-800" data-testid={`alert-detail-${alert.id}`}>
                        <TableCell className="text-white text-sm">
                          {new Date(alert.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-white">{alert.tourist_name}</TableCell>
                        <TableCell className="text-slate-400 font-mono text-xs">{alert.tourist_id}</TableCell>
                        <TableCell>
                          <Badge variant={alert.alert_type === 'panic' ? 'destructive' : 'default'}>
                            {alert.alert_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={alert.risk_score >= 80 ? 'text-red-500 font-semibold' : 'text-amber-500'}>
                            {alert.risk_score}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-400 max-w-xs truncate">
                          {alert.reason}
                        </TableCell>
                        <TableCell>
                          <Badge variant={alert.status === 'resolved' ? 'success' : alert.status === 'pending' ? 'destructive' : 'secondary'}>
                            {alert.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-400">
                          {alert.assigned_officer || '-'}
                        </TableCell>
                        <TableCell>
                          {alert.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateAlert(alert.id, 'resolved', user?.name)}
                                data-testid={`resolve-btn-${alert.id}`}
                              >
                                Resolve
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tourists Tab */}
        {selectedView === 'tourists' && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Tourist Directory</CardTitle>
                <Input
                  placeholder="Search tourists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 bg-slate-800 border-slate-700"
                  data-testid="search-tourists-input"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-400">Tourist ID</TableHead>
                      <TableHead className="text-slate-400">Name</TableHead>
                      <TableHead className="text-slate-400">Safety Score</TableHead>
                      <TableHead className="text-slate-400">Entry Date</TableHead>
                      <TableHead className="text-slate-400">Exit Date</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400">Emergency Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTourists.map((tourist) => (
                      <TableRow key={tourist.tourist_id} className="border-slate-800" data-testid={`tourist-row-${tourist.tourist_id}`}>
                        <TableCell className="font-mono text-xs text-blue-400">{tourist.tourist_id}</TableCell>
                        <TableCell className="text-white font-semibold">{tourist.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              tourist.safety_score >= 80 ? 'bg-emerald-500' :
                              tourist.safety_score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                            <span className={`font-semibold ${
                              tourist.safety_score >= 80 ? 'text-emerald-500' :
                              tourist.safety_score >= 50 ? 'text-amber-500' : 'text-red-500'
                            }`}>
                              {tourist.safety_score?.toFixed(0)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {new Date(tourist.entry_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {new Date(tourist.exit_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={tourist.status === 'active' ? 'success' : 'secondary'}>
                            {tourist.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">{tourist.emergency_contact}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Tab */}
        {selectedView === 'analytics' && (
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Alerts Trend (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={alertsPerDayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                    <Legend />
                    <Line type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Risk Zone Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { level: 'High', count: geoZones.filter(z => z.risk_level === 'high').length },
                      { level: 'Medium', count: geoZones.filter(z => z.risk_level === 'medium').length },
                      { level: 'Low', count: geoZones.filter(z => z.risk_level === 'low').length },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="level" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Alert Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { type: 'Panic', count: alerts.filter(a => a.alert_type === 'panic').length },
                      { type: 'AI Anomaly', count: alerts.filter(a => a.alert_type === 'ai_anomaly').length },
                      { type: 'High Risk', count: alerts.filter(a => a.alert_type === 'high_risk').length },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="type" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                      <Bar dataKey="count" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;