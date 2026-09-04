import React from 'react';
import * as Icons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = '', size = 20, color }) => {
  const IconComponent = (Icons as unknown as Record<string, React.ElementType>)[name] || Icons.CheckCircle;

  return <IconComponent className={className} size={size} style={color ? { color } : undefined} />;
};
