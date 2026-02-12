import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, AlertTriangle } from 'lucide-react';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LiveMap = ({ 
  center = [28.6139, 77.2090], 
  zoom = 13, 
  tourists = [], 
  alerts = [], 
  geoZones = [],
  showCurrentLocation = false,
  currentLocation = null
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add current location marker
    if (showCurrentLocation && currentLocation) {
      const currentMarker = L.marker([currentLocation.lat, currentLocation.lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background: #2563eb; color: white; padding: 8px; border-radius: 50%; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        })
      }).addTo(mapInstance.current);
      currentMarker.bindPopup('Your Current Location');
      markersRef.current.push(currentMarker);
      mapInstance.current.setView([currentLocation.lat, currentLocation.lng], zoom);
    }

    // Add tourist markers
    tourists.forEach(tourist => {
      if (tourist.latitude && tourist.longitude) {
        const marker = L.marker([tourist.latitude, tourist.longitude], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: #10b981; color: white; padding: 6px; border-radius: 50%; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg></div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          })
        }).addTo(mapInstance.current);
        marker.bindPopup(`<b>${tourist.name}</b><br/>Tourist ID: ${tourist.tourist_id}<br/>Safety Score: ${tourist.safety_score}`);
        markersRef.current.push(marker);
      }
    });

    // Add alert markers
    alerts.forEach(alert => {
      if (alert.latitude && alert.longitude) {
        const marker = L.marker([alert.latitude, alert.longitude], {
          icon: L.divIcon({
            className: 'custom-marker map-marker-pulse',
            html: `<div style="background: #dc2626; color: white; padding: 8px; border-radius: 50%; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.6);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          })
        }).addTo(mapInstance.current);
        marker.bindPopup(`<b>ALERT: ${alert.alert_type}</b><br/>Tourist: ${alert.tourist_name}<br/>Risk Score: ${alert.risk_score}<br/>Status: ${alert.status}`);
        markersRef.current.push(marker);
      }
    });

    // Add geo zones
    if (Array.isArray(geoZones)) {
      geoZones.forEach(zone => {
        const color = zone.risk_level === 'high' ? '#dc2626' : zone.risk_level === 'medium' ? '#f59e0b' : '#10b981';
        const circle = L.circle([zone.center_lat, zone.center_lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.2,
          radius: zone.radius * 1000 // Convert to meters
        }).addTo(mapInstance.current);
        circle.bindPopup(`<b>${zone.name}</b><br/>Risk Level: ${zone.risk_level}<br/>${zone.description || ''}`);
        markersRef.current.push(circle);
      });
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
    };
  }, [center, zoom, tourists, alerts, geoZones, showCurrentLocation, currentLocation]);

  return <div ref={mapRef} className="w-full h-full rounded-lg" data-testid="live-map" style={{ minHeight: '400px' }} />;
};

export default LiveMap;