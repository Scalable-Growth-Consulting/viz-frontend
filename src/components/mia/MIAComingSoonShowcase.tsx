import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface MIAComingSoonHighlight {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface MIAComingSoonMetric {
  label: string;
  value: string;
  detail: string;
}

export interface MIAComingSoonMilestone {
  title: string;
  description: string;
  eta?: string;
}

type ButtonVariant = React.ComponentProps<typeof Button>['variant'];

export interface MIAComingSoonAction {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  to?: string;
  onClick?: () => void;
  className?: string;
  variant?: ButtonVariant;
  external?: boolean;
}

export interface MIAComingSoonShowcaseProps {
  badgeLabel?: string;
  badgeIcon?: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
  icon?: React.ReactNode;
  iconContainerClass?: string;
  highlightIconClass?: string;
  highlights: MIAComingSoonHighlight[];
  metrics?: MIAComingSoonMetric[];
  milestones?: MIAComingSoonMilestone[];
  actions?: MIAComingSoonAction[];
  footnote?: React.ReactNode;
}

const MIAComingSoonShowcase: React.FC<MIAComingSoonShowcaseProps> = ({
  badgeLabel,
  badgeIcon,
  title,
  subtitle,
  description,
  gradient,
  icon,
  iconContainerClass,
  highlightIconClass,
  highlights,
  metrics = [],
  milestones = [],
  actions = [],
  footnote,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute inset-0 bg-white/40" />

      <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-16">
        <div className="max-w-5xl space-y-6">
          {badgeLabel && (
            <Badge className="inline-flex items-center gap-2 bg-white/80 text-slate-900 border border-white px-4 py-2 text-xs font-semibold tracking-wide uppercase shadow-sm">
              {badgeIcon}
              {badgeLabel}
            </Badge>
          )}

          <div className="flex items-start gap-6 flex-wrap text-white">
            {icon && (
              <div
                className={`p-4 rounded-2xl inline-flex items-center justify-center shadow-lg ${
                  iconContainerClass ?? 'bg-white/15 border border-white/30 text-white'
                }`}
              >
                {icon}
              </div>
            )}
            <div className="space-y-3 text-balance">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)]">
                {title}
              </h2>
              <p className="text-lg sm:text-xl font-semibold text-white/85">
                {subtitle}
              </p>
              <p className="text-base sm:text-lg text-white/85 max-w-3xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {actions.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {actions.map((action, index) => {
                const content = (
                  <>
                    {action.icon && <span className="mr-2 inline-flex items-center">{action.icon}</span>}
                    {action.label}
                  </>
                );

                if (action.to) {
                  return (
                    <Button
                      key={`action-to-${index}`}
                      variant={action.variant ?? 'default'}
                      className={`shadow-lg shadow-slate-200/70 ${action.className ?? ''}`}
                      asChild
                    >
                      <Link to={action.to}>{content}</Link>
                    </Button>
                  );
                }

                if (action.href) {
                  return (
                    <Button
                      key={`action-href-${index}`}
                      variant={action.variant ?? 'default'}
                      className={`shadow-lg shadow-slate-200/70 ${action.className ?? ''}`}
                      asChild
                    >
                      <a
                        href={action.href}
                        target={action.external ? '_blank' : undefined}
                        rel={action.external ? 'noopener noreferrer' : undefined}
                      >
                        {content}
                      </a>
                    </Button>
                  );
                }

                return (
                  <Button
                    key={`action-onclick-${index}`}
                    variant={action.variant ?? 'default'}
                    className={`shadow-lg shadow-slate-200/70 ${action.className ?? ''}`}
                    onClick={action.onClick}
                  >
                    {content}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {highlights.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {highlights.map((highlight, index) => (
              <div
                key={highlight.title + index}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_top,_rgba(148,163,255,0.25),_transparent_65%)]" />
                <div className="relative z-10 space-y-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${
                      highlightIconClass ?? 'bg-slate-900 text-white border-slate-800'
                    }`}
                  >
                    {highlight.icon}
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">{highlight.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {(metrics.length > 0 || milestones.length > 0) && (
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {metrics.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Experience Impact</h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  {metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center shadow-inner"
                    >
                      <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
                      <div className="text-xs uppercase tracking-wide text-slate-500 mt-1">{metric.label}</div>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{metric.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {milestones.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Launch Timeline</h4>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div
                      key={milestone.title + index}
                      className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold text-slate-900">{milestone.title}</div>
                          <p className="text-sm text-slate-600 leading-relaxed mt-1">
                            {milestone.description}
                          </p>
                        </div>
                        {milestone.eta && (
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {milestone.eta}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {footnote && (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            {footnote}
          </div>
        )}
      </div>
    </div>
  );
};

export default MIAComingSoonShowcase;
