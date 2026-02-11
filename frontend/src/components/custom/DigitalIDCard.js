import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, QrCode, Calendar, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DigitalIDCard = ({ tourist }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!tourist) return null;

  const isActive = tourist.status === 'active';
  const isExpired = new Date(tourist.exit_date) < new Date();

  return (
    <div className="perspective-1000 w-full max-w-md mx-auto" data-testid="digital-id-card">
      <motion.div
        className="relative w-full h-64 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Side */}
        <Card
          className="absolute w-full h-full backface-hidden shadow-2xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <CardContent className="p-6 h-full flex flex-col justify-between bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-6 h-6" />
                  <span className="font-heading font-bold text-lg">Tourist ID</span>
                </div>
                <Badge
                  data-testid="id-status-badge"
                  className={isActive && !isExpired ? 'bg-safety-emerald' : 'bg-gray-500'}
                >
                  {isExpired ? 'Expired' : tourist.status}
                </Badge>
              </div>
              {tourist.photo_url && (
                <img
                  src={tourist.photo_url}
                  alt="Tourist"
                  className="w-20 h-20 rounded-full border-4 border-white object-cover"
                  data-testid="tourist-photo"
                />
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-bold" data-testid="tourist-name">
                {tourist.name}
              </h2>
              <p className="font-mono text-sm opacity-90" data-testid="tourist-id">
                ID: {tourist.tourist_id}
              </p>
            </div>

            <div className="flex justify-between items-end text-xs opacity-75">
              <div>
                <Calendar className="w-3 h-3 inline mr-1" />
                Valid: {new Date(tourist.entry_date).toLocaleDateString()} - {new Date(tourist.exit_date).toLocaleDateString()}
              </div>
              <div>
                <Phone className="w-3 h-3 inline mr-1" />
                {tourist.emergency_contact}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Side */}
        <Card
          className="absolute w-full h-full backface-hidden shadow-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <CardContent className="p-6 h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 text-white">
            <div className="flex flex-col items-center gap-4">
              <QrCode className="w-8 h-8" />
              <h3 className="font-heading font-bold text-lg">Verification QR Code</h3>
              {tourist.qr_code ? (
                <img
                  src={`data:image/png;base64,${tourist.qr_code}`}
                  alt="QR Code"
                  className="w-40 h-40 bg-white p-2 rounded-lg"
                  data-testid="qr-code"
                />
              ) : (
                <div className="w-40 h-40 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs">QR Code Unavailable</span>
                </div>
              )}
              <p className="text-xs opacity-75 text-center font-mono" data-testid="blockchain-hash">
                Blockchain Hash: {tourist.blockchain_hash?.substring(0, 16)}...
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <p className="text-center text-sm text-muted-foreground mt-4">Click to flip card</p>
    </div>
  );
};

export default DigitalIDCard;