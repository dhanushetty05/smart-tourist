import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, LogOut, MapPin, AlertCircle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import SafetyScoreRing from '@/components/custom/SafetyScoreRing';
import PanicButton from '@/components/custom/PanicButton';
import LiveMap from '@/components/custom/LiveMap';
import DigitalIDCard from '@/components/custom/DigitalIDCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const TouristDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tourist, setTourist] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [geoZones, setGeoZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTouristProfile();
    fetchAlerts();
    fetchGeoZones();
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (currentLocation && tourist) {
      updateLocation();
    }
  }, [currentLocation]);

  const fetchTouristProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/tourists/me`);
      setTourist(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        navigate('/tourist/profile-setup');
      } else {
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API_URL}/alerts`);
      setAlerts(response.data);
    } catch (error) {
      console.error('Failed to load alerts');
    }
  };

  const fetchGeoZones = async () => {
    try {
      const response = await axios.get(`${API_URL}/geo-zones`);
      setGeoZones(response.data);
    } catch (error) {
      console.error('Failed to load geo zones');
    }
  };

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(loc);
          
          // Watch position for updates
          navigator.geolocation.watchPosition(
            (pos) => {
              setCurrentLocation({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              });
            },
            (error) => console.error('Location watch error:', error),
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
          );
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Location permission denied. Some features may not work.');
        }
      );
    } else {
      toast.error('Geolocation not supported by browser');
    }
  };

  const updateLocation = async () => {
    try {
      await axios.post(`${API_URL}/locations`, {
        latitude: currentLocation.lat,
        longitude: currentLocation.lng
      });
      // Refresh safety score
      fetchTouristProfile();
    } catch (error) {
      console.error('Failed to update location');
    }
  };

  const handlePanic = async () => {
    if (!currentLocation) {
      toast.error('Location unavailable. Please enable location services.');
      return;
    }

    try {
      await axios.post(`${API_URL}/alerts/panic`, {
        latitude: currentLocation.lat,
        longitude: currentLocation.lng
      });
      toast.success('Emergency alert sent! Authorities have been notified.');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to send emergency alert');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-trust-blue mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-trust-blue" />
            <div>
              <h1 className="text-xl font-heading font-bold text-civic-slate" data-testid="dashboard-title">Tourist Dashboard</h1>
              <p className="text-xs text-muted-foreground">Welcome, {user?.name}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} data-testid="logout-button">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Digital ID Card */}
        <section>
          <h2 className="text-2xl font-heading font-bold mb-4">Digital Tourist ID</h2>
          <DigitalIDCard tourist={tourist} />
        </section>

        {/* Safety Score & Panic Button */}
        <section className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Your Safety Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <SafetyScoreRing score={tourist?.safety_score || 85} size={220} />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader>
              <CardTitle className="text-signal-red">Emergency Alert</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <PanicButton onPanic={handlePanic} disabled={!currentLocation} />
            </CardContent>
          </Card>
        </section>

        {/* Live Map */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Live Location & Safety Zones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden">
                <LiveMap
                  center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [28.6139, 77.2090]}
                  zoom={13}
                  showCurrentLocation={true}
                  currentLocation={currentLocation}
                  geoZones={geoZones}
                  alerts={alerts.filter(a => a.tourist_id === tourist?.tourist_id)}
                />
              </div>
              {!currentLocation && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Enable location services to see your position on the map
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Alert History */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Alert History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8" data-testid="no-alerts-message">
                  No alerts recorded. Stay safe!
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Alert Type</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.map((alert) => (
                        <TableRow key={alert.id} data-testid={`alert-row-${alert.id}`}>
                          <TableCell>
                            {new Date(alert.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={alert.alert_type === 'panic' ? 'destructive' : 'default'}>
                              {alert.alert_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={alert.risk_score >= 80 ? 'text-red-600 font-semibold' : 'text-amber-600'}>
                              {alert.risk_score}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={alert.status === 'resolved' ? 'success' : 'secondary'}>
                              {alert.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{alert.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default TouristDashboard;