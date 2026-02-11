import React from 'react';
import { motion } from 'framer-motion';

const SafetyScoreRing = ({ score = 85, size = 200 }) => {
  const radius = (size - 40) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#dc2626';
  };

  const getLabel = () => {
    if (score >= 80) return 'Safe';
    if (score >= 50) return 'Moderate';
    return 'High Risk';
  };

  return (
    <div className="flex flex-col items-center" data-testid="safety-score-ring">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="16"
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="safety-ring"
        />
      </svg>
      <div className="absolute flex flex-col items-center" style={{ marginTop: size / 2 - 30 }}>
        <span className="text-4xl font-heading font-bold" style={{ color: getColor() }}>
          {Math.round(score)}
        </span>
        <span className="text-sm text-muted-foreground mt-1">{getLabel()}</span>
      </div>
    </div>
  );
};

export default SafetyScoreRing;