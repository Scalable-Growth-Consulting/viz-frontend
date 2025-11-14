import React from 'react';
import {
  Brain,
  Crown,
  MessageCircle,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Network,
  Compass,
  LineChart,
  BarChart3,
  Lightbulb,
  Shield,
  Users,
  CalendarClock,
  Zap,
  Globe,
} from 'lucide-react';
import MIAComingSoonShowcase, {
  MIAComingSoonAction,
  MIAComingSoonHighlight,
  MIAComingSoonMetric,
  MIAComingSoonMilestone,
} from '@/components/mia/MIAComingSoonShowcase';

interface ExperienceConfig {
  badgeLabel: string;
  badgeIcon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
  icon: React.ReactNode;
  iconContainerClass?: string;
  highlightIconClass?: string;
  highlights: MIAComingSoonHighlight[];
  metrics: MIAComingSoonMetric[];
  milestones: MIAComingSoonMilestone[];
  actions: MIAComingSoonAction[];
  footnote?: React.ReactNode;
}

const experiences: Record<'core' | 'reddit' | 'keyword' | 'creative' | 'brandlenz', ExperienceConfig> = {
  core: {
    badgeLabel: 'Admin Exclusive Suite',
    badgeIcon: <Crown className="w-4 h-4" />,
    title: 'MIA Core Intelligence',
    subtitle: 'Unified command center for elite growth teams',
    description:
      'Unlock panoramic visibility across every marketing motion. AI-orchestrated dashboards, cross-platform attribution, and campaign intelligence designed for the highest-performing teams.',
    gradient: 'from-[#2E026D] via-[#6E21C8] to-[#9333EA]',
    icon: <Brain className="w-12 h-12 text-white" />,
    iconContainerClass: 'bg-[#2E026D] border-white/20 text-white shadow-[0_12px_30px_rgba(110,33,200,0.45)]',
    highlightIconClass: 'bg-[#3B0A8A] text-white border-[#4C1D95]',
    highlights: [
      {
        title: 'Mission Control Dashboards',
        description:
          'Reimagine analytics with living dashboards that explain the why behind every metric using narratively rich AI insights.',
        icon: <LineChart className="w-5 h-5" />,
      },
      {
        title: 'Autonomous Recommendations',
        description:
          'MIA synthesizes next-best actions across channels, media plans, and audiences—tailored to your growth blueprint.',
        icon: <Lightbulb className="w-5 h-5" />,
      },
      {
        title: 'Enterprise Guardrails',
        description:
          'Audit-ready data lineage, SOC2-aligned policies, and multi-environment access controls keep your teams secure.',
        icon: <Shield className="w-5 h-5" />,
      },
    ],
    metrics: [
      {
        label: 'Decision Velocity',
        value: '4× faster',
        detail: 'AI-generated narratives accelerate leadership standups and war-room decisions.',
      },
      {
        label: 'Cross-Team Alignment',
        value: '98%',
        detail: 'Unified data models that collapse silos between performance, brand, and product squads.',
      },
      {
        label: 'Lift in ROI',
        value: '+31%',
        detail: 'Customers report compounding impact within the first 6 weeks of activation.',
      },
    ],
    milestones: [
      {
        title: 'Executive Beta',
        description: 'Curated onboarding for executive leadership teams with dedicated strategy pods.',
        eta: 'Coming 2026',
      },
      {
        title: 'Signal Studio',
        description: 'Generative storytelling for campaign retros, quarterly business reviews, and board-ready reporting.',
        eta: 'Q1 2026',
      },
      {
        title: 'Automation Galaxy',
        description: 'No-code automations to launch optimizations directly into Meta, Google, and CRM ecosystems.',
        eta: 'Q2 2026',
      },
    ],
    actions: [
      {
        label: 'Request Executive Preview',
        icon: <Rocket className="w-4 h-4" />,
        href: 'mailto:hello@sgconsultingtech.com?subject=MIA%20Core%20Preview%20Request',
        className: 'bg-white text-slate-900 hover:bg-slate-100',
      },
      {
        label: 'Return to SEO-GEO',
        icon: <Compass className="w-4 h-4" />,
        to: '/mia/seo-geo',
        variant: 'outline',
        className: 'border-slate-300 text-slate-700 hover:bg-slate-100',
      },
    ],
    footnote: (
      <div>
        Teams onboarded to MIA Core receive white-glove migration, advanced schema design, and a private AI alignment session to wire marketing goals directly into your agent network.
      </div>
    ),
  },
  reddit: {
    badgeLabel: 'Premium Agent',
    badgeIcon: <Sparkles className="w-4 h-4" />,
    title: 'Reddit CoPilot',
    subtitle: 'Community-native conversations, amplified with AI.',
    description:
      'Deploy a brand voice that learns, adapts, and engages live communities at scale. Reddit CoPilot blends sentiment-aware automation with human-grade authenticity.',
    gradient: 'from-[#C2410C] via-[#EA580C] to-[#FB923C]',
    icon: <MessageCircle className="w-12 h-12 text-white" />,
    iconContainerClass: 'bg-[#C2410C] border-white/15 text-white shadow-[0_12px_30px_rgba(226,121,40,0.45)]',
    highlightIconClass: 'bg-[#A23408] text-white border-[#EA580C]',
    highlights: [
      {
        title: 'Persona Amplification',
        description:
          'Dynamic copy that aligns with subreddit culture, while staying on-brand and policy compliant.',
        icon: <Users className="w-5 h-5" />,
      },
      {
        title: 'Live Sentiment Orbits',
        description:
          'Map sentiment arcs, key competitors, and emerging influence nodes in real time.',
        icon: <TrendingUp className="w-5 h-5" />,
      },
      {
        title: 'Closed-Loop Intelligence',
        description:
          'Insights feed back into campaign playbooks, unlocking smarter paid social, search, and community activation.',
        icon: <Network className="w-5 h-5" />,
      },
    ],
    metrics: [
      {
        label: 'Engagement Lift',
        value: '5.4×',
        detail: 'Avg increase in quality conversations within strategic subreddit clusters.',
      },
      {
        label: 'Brand Safety Score',
        value: '99.2%',
        detail: 'Proactive compliance guardrails across community guidelines and legal thresholds.',
      },
      {
        label: 'Playbook Velocity',
        value: '2 days',
        detail: 'Time to deploy bespoke engagement playbooks for new product or campaign drops.',
      },
    ],
    milestones: [
      {
        title: 'Command Center',
        description: 'Multi-brand orchestration, response queues, and live agent collaboration.',
        eta: 'Q1 2026',
      },
      {
        title: 'Unified Attribution',
        description: 'Link community momentum with Google Analytics, Meta, and CRM event streams.',
        eta: 'Q2 2026',
      },
      {
        title: 'Multi-Language Brain',
        description: 'Adaptive linguistics for multilingual sub-communities with cultural intelligence.',
        eta: 'Q3 2026',
      },
    ],
    actions: [
      {
        label: 'Unlock Premium Access',
        icon: <Crown className="w-4 h-4" />,
        href: 'mailto:hello@sgconsultingtech.com?subject=Reddit%20CoPilot%20Access',
        className: 'bg-white text-orange-600 hover:bg-orange-50',
      },
      {
        label: 'Discover SEO-GEO',
        icon: <Compass className="w-4 h-4" />,
        to: '/mia/seo-geo',
        variant: 'outline',
        className: 'border-slate-300 text-slate-700 hover:bg-slate-100',
      },
    ],
    footnote: (
      <div>
        Every deployment includes real-time compliance monitoring, quarterly brand voice calibrations, and opt-in human review workflows tailored to your governance model.
      </div>
    ),
  },
  keyword: {
    badgeLabel: 'Intelligence in Alpha',
    badgeIcon: <BarChart3 className="w-4 h-4" />,
    title: 'Keyword & Trend Constellation',
    subtitle: 'Predict the next cultural wave before it breaks.',
    description:
      'Trend intelligence fused with demand modeling. Illuminate cross-channel behavior shifts and prime your campaigns for first-mover impact.',
    gradient: 'from-[#1D2671] via-[#5C3BE8] to-[#A855F7]',
    icon: <Target className="w-12 h-12 text-white" />,
    iconContainerClass: 'bg-[#1D2671] border-white/15 text-white shadow-[0_12px_30px_rgba(76,79,191,0.45)]',
    highlightIconClass: 'bg-[#273499] text-white border-[#5C3BE8]',
    highlights: [
      {
        title: 'Signals Across the Stack',
        description:
          'Harmonize search, social, marketplace, and conversation data into a single source of cultural truth.',
        icon: <Brain className="w-5 h-5" />,
      },
      {
        title: 'Forecasting Canvas',
        description:
          'Scenario plan seasonal shifts, competitive breakouts, and creative pivots with explainable AI.',
        icon: <Compass className="w-5 h-5" />,
      },
      {
        title: 'Opportunity Radar',
        description:
          'Receive instant alerts when your category heats up—complete with creative prompts and bid strategies.',
        icon: <Sparkles className="w-5 h-5" />,
      },
    ],
    metrics: [
      {
        label: 'Market Pulse Refresh',
        value: 'Every 60m',
        detail: 'Pulse updates across global cohorts and category segments.',
      },
      {
        label: 'Signal Coverage',
        value: '23 sources',
        detail: 'Integrated pipelines across ad networks, commerce hubs, and social surfaces.',
      },
      {
        label: 'Campaign Acceleration',
        value: '+19%',
        detail: 'Faster go-to-market cycles powered by proactive creative and budget recommendations.',
      },
    ],
    milestones: [
      {
        title: 'Alpha Partner Cohort',
        description: 'Invitation-only pilot with real-time success concierge and insight architects.',
        eta: 'Q1 2026',
      },
      {
        title: 'Creator Signal Graph',
        description: 'Map emerging creator influence on keyword demand and storytelling velocity.',
        eta: 'Q3 2026',
      },
      {
        title: 'Revenue Bridge',
        description: 'Connect pipeline impact to campaign activity with predictive revenue modeling.',
        eta: 'Q4 2026',
      },
    ],
    actions: [
      {
        label: 'Apply for Alpha Cohort',
        icon: <CalendarClock className="w-4 h-4" />,
        href: 'mailto:hello@sgconsultingtech.com?subject=Keyword%20Trend%20Alpha',
        className: 'bg-white text-indigo-600 hover:bg-indigo-50',
      },
      {
        label: 'Explore SEO-GEO Intelligence',
        icon: <Compass className="w-4 h-4" />,
        to: '/mia/seo-geo',
        variant: 'outline',
        className: 'border-slate-300 text-slate-700 hover:bg-slate-100',
      },
    ],
    footnote: (
      <div>
        Early partners receive bespoke data onboarding, experiment co-design, and private roadmap influence sessions with our product science team.
      </div>
    ),
  },
  creative: {
    badgeLabel: 'Design Intelligence',
    badgeIcon: <Zap className="w-4 h-4" />,
    title: 'Creative Labs',
    subtitle: 'Automated creative prototyping with brand-safe intelligence.',
    description:
      'Blend generative artistry with performance insights. Creative Labs drafts, tests, and iterates campaign visuals and copy matched to brand guidelines.',
    gradient: 'from-[#3E1E68] via-[#9B287B] to-[#F06199]',
    icon: <Sparkles className="w-12 h-12 text-white" />,
    iconContainerClass: 'bg-[#6F1E6E] border-white/20 text-white shadow-[0_12px_30px_rgba(240,97,153,0.45)]',
    highlightIconClass: 'bg-[#7F257F] text-white border-[#9B287B]',
    highlights: [
      {
        title: 'Generative Studio',
        description: 'Launch image, video, and copy variants with on-brand templates and AI art directors.',
        icon: <Sparkles className="w-5 h-5" />,
      },
      {
        title: 'Performance Feedback Loop',
        description: 'Creative scores sync with paid media metrics to guide the next iteration instantly.',
        icon: <TrendingUp className="w-5 h-5" />,
      },
      {
        title: 'Brand Safety Mesh',
        description: 'Automated compliance checks across tone, color, logo usage, and regulatory guardrails.',
        icon: <Shield className="w-5 h-5" />,
      },
    ],
    metrics: [
      {
        label: 'Concept Velocity',
        value: '12x',
        detail: 'Faster turnarounds from brief to polished asset suites.',
      },
      {
        label: 'Variant Testing',
        value: '30/day',
        detail: 'Parallel multivariate experiments generated and versioned automatically.',
      },
      {
        label: 'Brand Compliance',
        value: '99.7%',
        detail: 'AI scoring ensures every asset respects brand DNA before deployment.',
      },
    ],
    milestones: [
      {
        title: 'Creative Canvas',
        description: 'Real-time co-editing with AI art direction and storyboard generators.',
        eta: 'Q1 2026',
      },
      {
        title: 'Omni-Channel Exporter',
        description: 'One-click publishing to Meta, Google, TikTok, and programmatic suites.',
        eta: 'Q2 2026',
      },
      {
        title: 'Motion Intelligence',
        description: 'Auto-assembled motion graphics from static concepts and performance cues.',
        eta: 'Q4 2026',
      },
    ],
    actions: [
      {
        label: 'Join Creative Alpha',
        icon: <Zap className="w-4 h-4" />,
        href: 'mailto:hello@sgconsultingtech.com?subject=Creative%20Labs%20Alpha',
        className: 'bg-white text-pink-600 hover:bg-pink-50',
      },
      {
        label: 'Return to SEO-GEO',
        icon: <Compass className="w-4 h-4" />,
        to: '/mia/seo-geo',
        variant: 'outline',
        className: 'border-slate-300 text-slate-700 hover:bg-slate-100',
      },
    ],
    footnote: (
      <div>
        Creative Labs partners receive bespoke brand onboarding, custom style-library creation, and AI coaching sessions for hybrid teams.
      </div>
    ),
  },
  brandlenz: {
    badgeLabel: 'Signal Intelligence',
    badgeIcon: <Brain className="w-4 h-4" />,
    title: 'Brandlenz Observatory',
    subtitle: 'Hyper-aware social listening and brand health intelligence.',
    description:
      'Monitor every mention, campaign ripple, and competitor move with AI-detected narratives and sentiment graphs.',
    gradient: 'from-[#141E30] via-[#243B55] to-[#4A69BD]',
    icon: <Globe className="w-12 h-12 text-white" />,
    iconContainerClass: 'bg-[#1B2A4A] border-white/20 text-white shadow-[0_12px_30px_rgba(74,105,189,0.45)]',
    highlightIconClass: 'bg-[#20355E] text-white border-[#4A69BD]',
    highlights: [
      {
        title: '11+ Channel Listening',
        description: 'Synthesize signals from social, forums, news, podcasts, and reviews into one canvas.',
        icon: <Network className="w-5 h-5" />,
      },
      {
        title: 'Sentiment Cartography',
        description: 'Map real-time sentiment shifts by channel, audience, and creative driver.',
        icon: <Compass className="w-5 h-5" />,
      },
      {
        title: 'Competitive Pulse',
        description: 'Automated benchmark alerts with share-of-voice, creative moves, and growth threats.',
        icon: <Target className="w-5 h-5" />,
      },
    ],
    metrics: [
      {
        label: 'Signal Sources',
        value: '58+',
        detail: 'Expanded data partnerships across geo-specific and niche channels.',
      },
      {
        label: 'Issue Detection',
        value: 'Under 15m',
        detail: 'Average time to surface emerging PR or CX risk for response teams.',
      },
      {
        label: 'Campaign Lift',
        value: '+27%',
        detail: 'Correlated improvement when Brandlenz insights feed media optimization.',
      },
    ],
    milestones: [
      {
        title: 'Narrative Graphs',
        description: 'Story-level clustering to track how brand narratives evolve daily.',
        eta: 'Q2 2026',
      },
      {
        title: 'CX Escalation Grid',
        description: 'Route support-critical mentions directly into CRM and helpdesk workflows.',
        eta: 'Q3 2026',
      },
      {
        title: 'Influencer Intelligence',
        description: 'Identify emerging advocates and detractors with engagement heat maps.',
        eta: 'Q4 2026',
      },
    ],
    actions: [
      {
        label: 'Schedule Brandlenz Preview',
        icon: <Brain className="w-4 h-4" />,
        href: 'mailto:hello@sgconsultingtech.com?subject=Brandlenz%20Preview',
        className: 'bg-white text-blue-600 hover:bg-blue-50',
      },
      {
        label: 'Return to SEO-GEO',
        icon: <Compass className="w-4 h-4" />,
        to: '/mia/seo-geo',
        variant: 'outline',
        className: 'border-slate-300 text-slate-700 hover:bg-slate-100',
      },
    ],
    footnote: (
      <div>
        Enterprise listeners unlock custom taxonomies, crisis war rooms, and co-piloted reporting tailored to executive teams.
      </div>
    ),
  },
};

const ExperienceWrapper: React.FC<{ experience: ExperienceConfig }> = ({ experience }) => {
  return (
    <div className="relative min-h-[70vh] w-full overflow-hidden bg-[#f7f7f7]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,255,0.12),_transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(255,215,172,0.12),_transparent_55%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-10">
        <MIAComingSoonShowcase
          badgeLabel={experience.badgeLabel}
          badgeIcon={experience.badgeIcon}
          title={experience.title}
          subtitle={experience.subtitle}
          description={experience.description}
          gradient={experience.gradient}
          icon={experience.icon}
          iconContainerClass={experience.iconContainerClass}
          highlightIconClass={experience.highlightIconClass}
          highlights={experience.highlights}
          metrics={experience.metrics}
          milestones={experience.milestones}
          actions={experience.actions}
          footnote={experience.footnote}
        />
      </div>
    </div>
  );
};

export const MIACoreComingSoon: React.FC = () => <ExperienceWrapper experience={experiences.core} />;

export const RedditAgentComingSoon: React.FC = () => (
  <ExperienceWrapper experience={experiences.reddit} />
);

export const KeywordTrendComingSoon: React.FC = () => (
  <ExperienceWrapper experience={experiences.keyword} />
);

export const CreativeLabsComingSoon: React.FC = () => (
  <ExperienceWrapper experience={experiences.creative} />
);

export const BrandlenzComingSoon: React.FC = () => (
  <ExperienceWrapper experience={experiences.brandlenz} />
);
