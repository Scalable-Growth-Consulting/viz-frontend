import React from 'react';
import {
  MessageSquare,
  Brain,
  MessageCircle,
  Crown,
  Target,
  Sparkles,
  Globe,
  TrendingUp,
  Package,
  LucideIcon,
} from 'lucide-react';

const buildIcon = (Icon: LucideIcon, className: string) =>
  React.createElement(Icon, { className });

export type AgentItem = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  tags: string[];
  route: string;
  gradient: string;
  icon: React.ReactNode;
  access: 'public' | 'premium';
  featuredPriority: number;
};

export const AGENT_LIST: AgentItem[] = [
  {
    id: 'bi-agent',
    name: 'BI Agent',
    subtitle: 'Business Intelligence',
    description: 'Chat with your data, build dashboards, and generate insights instantly.',
    tags: ['BIZ', 'analytics', 'dashboard', 'data', 'chat', 'insights'],
    route: '/agents/biz',
    gradient: 'from-viz-accent to-blue-600',
    icon: buildIcon(MessageSquare, 'w-6 h-6 text-white'),
    access: 'public',
    featuredPriority: 1,
  },
  {
    id: 'seo-geo-agent',
    name: 'SEO & GEO Agent',
    subtitle: 'Search + Generative Engine Optimization',
    description: 'Master-level SEO with AI-driven GEO signals, quick wins, and growth strategies.',
    tags: ['VEE', 'seo', 'geo', 'marketing', 'optimizer'],
    route: '/agents/seo-geo',
    gradient: 'from-blue-500 to-cyan-600',
    icon: buildIcon(Brain, 'w-6 h-6 text-white'),
    access: 'public',
    featuredPriority: 2,
  },
  {
    id: 'reddit-geo-agent',
    name: 'Reddit GEO Agent',
    subtitle: 'Standalone Growth Intelligence',
    description: 'Discover high-intent Reddit opportunities and craft risk-aware, conversion-ready responses.',
    tags: ['VEE', 'reddit', 'marketing', 'automation', 'geo', 'intelligence'],
    route: '/agents/reddit-geo',
    gradient: 'from-orange-500 to-red-600',
    icon: buildIcon(MessageCircle, 'w-6 h-6 text-white'),
    access: 'public',
    featuredPriority: 3,
  },
  {
    id: 'mia-core',
    name: 'MIA Core Intelligence',
    subtitle: 'Admin Exclusive Suite',
    description: 'Unified command center for elite growth teams with AI-orchestrated dashboards and intelligence.',
    tags: ['MIZ', 'core', 'analytics', 'leadership', 'marketing'],
    route: '/agents/mia-core',
    gradient: 'from-[#2E026D] via-[#6E21C8] to-[#9333EA]',
    icon: buildIcon(Crown, 'w-6 h-6 text-white'),
    access: 'public',
    featuredPriority: 4,
  },
  {
    id: 'keyword-trend',
    name: 'Keyword & Trend Constellation',
    subtitle: 'Intelligence in Alpha',
    description: 'Predict cultural waves before they crest with trend intelligence and demand modeling.',
    tags: ['VEE', 'marketing', 'seo', 'insights', 'analytics'],
    route: '/agents/keyword-discovery',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    icon: buildIcon(Target, 'w-6 h-6 text-white'),
    access: 'public',
    featuredPriority: 5,
  },
  {
    id: 'creative-labs',
    name: 'Creative Labs',
    subtitle: 'Design Intelligence',
    description: 'Automated creative prototyping that blends generative artistry with performance insights.',
    tags: ['MIZ', 'creative', 'marketing', 'automation', 'design'],
    route: '/agents/creative-labs',
    gradient: 'from-[#3E1E68] via-[#9B287B] to-[#F06199]',
    icon: buildIcon(Sparkles, 'w-6 h-6 text-white'),
    access: 'public',
    featuredPriority: 6,
  },
  {
    id: 'brandlenz',
    name: 'Brandlenz Sentinel',
    subtitle: 'Visibility Intelligence',
    description: 'Continuously sense brand health, competitive signals, and market bias across channels.',
    tags: ['MIZ', 'brand', 'analytics', 'marketing', 'insights'],
    route: '/agents/brandlenz',
    gradient: 'from-[#0F3D5F] via-[#256D85] to-[#3BA39C]',
    icon: buildIcon(Globe, 'w-6 h-6 text-white'),
    access: 'public',
    featuredPriority: 7,
  },
  {
    id: 'dufa',
    name: 'DUFA',
    subtitle: 'Demand Understanding & Forecasting',
    description: 'AI-powered demand forecasting and trend analysis to optimize inventory and reduce waste.',
    tags: ['RIZ', 'analytics', 'operations', 'forecasting', 'demand', 'retail'],
    route: '/agents/dufa',
    gradient: 'from-pink-500 to-rose-600',
    icon: buildIcon(TrendingUp, 'w-6 h-6 text-white'),
    access: 'premium',
    featuredPriority: 8,
  },
  {
    id: 'inventory-insight',
    name: 'IIA',
    subtitle: 'Inventory Intelligence Agent',
    description: 'Smart inventory optimization with real-time insights, stock alerts, and automated reordering.',
    tags: ['RIZ', 'operations', 'inventory', 'optimization', 'retail'],
    route: '/agents/inventory-insight',
    gradient: 'from-violet-500 to-purple-600',
    icon: buildIcon(Package, 'w-6 h-6 text-white'),
    access: 'premium',
    featuredPriority: 9,
  },
];
