import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Calendar, Phone, CreditCard, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const TouristProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    passport_number: '',
    entry_date: '',
    exit_date: '',
    emergency_contact: '',
    photo_url: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        entry_date: new Date(formData.entry_date).toISOString(),
        exit_date: new Date(formData.exit_date).toISOString()
      };
      
      await axios.post(`${API_URL}/tourists`, payload);
      toast.success('Tourist profile created successfully!');
      navigate('/tourist/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-trust-blue rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-heading font-bold" data-testid="profile-setup-title">
            Complete Your Profile
          </CardTitle>
          <CardDescription>Create your digital tourist ID for safe travel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  data-testid="name-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passport_number">Passport / Aadhaar Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="passport_number"
                    name="passport_number"
                    type="text"
                    placeholder="AB1234567"
                    className="pl-10"
                    value={formData.passport_number}
                    onChange={handleChange}
                    required
                    data-testid="passport-input"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entry_date">Trip Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="entry_date"
                    name="entry_date"
                    type="date"
                    className="pl-10"
                    value={formData.entry_date}
                    onChange={handleChange}
                    required
                    data-testid="entry-date-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exit_date">Trip End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="exit_date"
                    name="exit_date"
                    type="date"
                    className="pl-10"
                    value={formData.exit_date}
                    onChange={handleChange}
                    required
                    data-testid="exit-date-input"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="emergency_contact"
                  name="emergency_contact"
                  type="tel"
                  placeholder="+1234567890"
                  className="pl-10"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  required
                  data-testid="emergency-contact-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo_url">Photo URL (Optional)</Label>
              <div className="relative">
                <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="photo_url"
                  name="photo_url"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  className="pl-10"
                  value={formData.photo_url}
                  onChange={handleChange}
                  data-testid="photo-url-input"
                />
              </div>
              <p className="text-xs text-muted-foreground">Enter a direct link to your photo</p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-trust-blue hover:bg-blue-700" 
              disabled={loading}
              data-testid="submit-profile-button"
            >
              {loading ? 'Creating Profile...' : 'Create Digital Tourist ID'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TouristProfileSetup;