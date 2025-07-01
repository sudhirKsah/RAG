export interface CompanyData {
  companyName: string;
  description: string;
  responseTime: string;
  satisfaction: string;
  totalTickets: string;
  resolvedTickets: string;
  activeUsers: string;
  aiAccuracy: string;
}

export interface StatCard {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  gradient: string;
  iconGradient: string;
}

export interface ContactOption {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  gradient: string;
  badge?: string;
  badgeColor?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}