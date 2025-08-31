import { FC } from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{className?: string}>;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

const DashboardCard: FC<DashboardCardProps> = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 bg-blue-50',
    green: 'bg-green-500 text-green-600 bg-green-50',
    yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
    purple: 'bg-purple-500 text-purple-600 bg-purple-50'
  };

  const isPositive = change.startsWith('+');
  const isNegative = change.startsWith('-');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color].split(' ')[2]}`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[1]}`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className={`ml-2 text-sm font-medium ${
              isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
