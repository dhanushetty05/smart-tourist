import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-trust-blue" />
            <h1 className="text-2xl font-heading font-bold text-civic-slate">TouristGuard</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="ghost" data-testid="login-link">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-trust-blue hover:bg-blue-700" data-testid="register-link">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-5xl md:text-6xl font-heading font-extrabold text-civic-slate tracking-tight leading-tight">
            Ensuring Safe Travel Through
            <span className="block text-trust-blue mt-2">Smart Monitoring</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            AI-powered safety monitoring system that protects tourists with real-time tracking, 
            emergency response, and blockchain-verified digital IDs.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register">
              <Button size="lg" className="bg-trust-blue hover:bg-blue-700 text-lg px-8" data-testid="get-started-btn">
                Get Started
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button size="lg" variant="outline" className="text-lg px-8" data-testid="admin-portal-btn">
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-16">
          <img
            src="https://images.unsplash.com/photo-1561558471-ea8ebc7c9ae5"
            alt="Safe Tourism"
            className="rounded-2xl shadow-2xl mx-auto max-w-4xl w-full object-cover"
            style={{ maxHeight: '500px' }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12 text-civic-slate">
            Comprehensive Safety Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-trust-blue transition-all duration-300" data-testid="feature-digital-id">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-trust-blue" />
                </div>
                <h4 className="text-xl font-heading font-bold">Digital Tourist ID</h4>
                <p className="text-slate-600">
                  Blockchain-verified digital identification with QR code for instant verification
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-trust-blue transition-all duration-300" data-testid="feature-live-tracking">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <MapPin className="w-8 h-8 text-safety-emerald" />
                </div>
                <h4 className="text-xl font-heading font-bold">Live Location Tracking</h4>
                <p className="text-slate-600">
                  Real-time GPS tracking with high-risk zone alerts and safe zone recommendations
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-trust-blue transition-all duration-300" data-testid="feature-panic-button">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-signal-red" />
                </div>
                <h4 className="text-xl font-heading font-bold">Emergency Panic Button</h4>
                <p className="text-slate-600">
                  Instant SOS alerts sent to authorities with your exact location in emergencies
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-trust-blue transition-all duration-300" data-testid="feature-ai-monitoring">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <TrendingUp className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="text-xl font-heading font-bold">AI Safety Score</h4>
                <p className="text-slate-600">
                  Machine learning algorithms analyze patterns to predict and prevent incidents
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-heading font-bold text-trust-blue mb-2">24/7</div>
              <div className="text-slate-600">Real-time Monitoring</div>
            </div>
            <div>
              <div className="text-5xl font-heading font-bold text-safety-emerald mb-2">100%</div>
              <div className="text-slate-600">Blockchain Verified</div>
            </div>
            <div>
              <div className="text-5xl font-heading font-bold text-trust-blue mb-2">&lt;2min</div>
              <div className="text-slate-600">Average Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-civic-slate text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-6 h-6" />
            <span className="text-xl font-heading font-bold">TouristGuard</span>
          </div>
          <p className="text-slate-400">
            Smart Tourist Safety Monitoring & Incident Response System
          </p>
          <p className="text-slate-500 text-sm mt-4">
            © 2025 TouristGuard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;