import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatItem {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

const QuickStats = () => {
  const stats: StatItem[] = [
    {
      label: 'Orçamentos Hoje',
      value: '12',
      change: 8.2,
      trend: 'up'
    },
    {
      label: 'Usuários Online',
      value: '3',
      change: -2.1,
      trend: 'down'
    },
    {
      label: 'Sistema',
      value: 'Online',
      change: 0,
      trend: 'neutral'
    }
  ];

  const getTrendIcon = (trend: StatItem['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: StatItem['trend']) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(stat.trend)}
                {stat.change !== 0 && (
                  <span className={`text-xs font-medium ${getTrendColor(stat.trend)}`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickStats;