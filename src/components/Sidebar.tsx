import React from 'react';
import {
  Compass,
  GraduationCap,
  Building2,
  Mail,
  KanbanSquare,
  Route,
  BookOpen,
  X,
  Sparkles,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { ApplicationRecord } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  applications: ApplicationRecord[];
  savedCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  applications,
  savedCount,
  mobileOpen,
  onCloseMobile,
}) => {
  const pendingFollowups = applications.filter(
    (a) =>
      ['Applied', 'Follow-up sent'].includes(a.status) &&
      a.nextActionDate &&
      a.nextActionDate <= new Date().toISOString().split('T')[0]
  ).length;

  const navItems = [
    {
      id: 'start',
      label: 'Start Here',
      icon: Compass,
      tag: null,
    },
    {
      id: 'faculty',
      label: 'Faculty Directory',
      icon: GraduationCap,
      tag: '1,610',
    },
    {
      id: 'drdo',
      label: 'DRDO Directory',
      icon: Building2,
      tag: '50 Labs',
    },
    {
      id: 'trending',
      label: 'Trending Opportunities',
      icon: Flame,
      tag: 'Live AI',
    },
    {
      id: 'email',
      label: 'Email Studio',
      icon: Mail,
      tag: '5 Templates',
    },
    {
      id: 'tracker',
      label: 'My Applications',
      icon: KanbanSquare,
      badge: applications.length > 0 ? applications.length : null,
      alert: pendingFollowups > 0 ? pendingFollowups : null,
    },
    {
      id: 'roadmap',
      label: 'Research Roadmap',
      icon: Route,
      tag: '6 Weeks',
    },
    {
      id: 'resources',
      label: 'Resources & Guides',
      icon: BookOpen,
      tag: 'Guides',
    },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-ink-primary/30 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#FAF8F5] border-r border-stone-line flex flex-col z-50 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-float' : '-translate-x-full'
        }`}
      >
        {/* App Logo & Header */}
        <div className="p-5 border-b border-stone-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-serif text-lg font-bold shadow-subtle">
              W
            </div>
            <div>
              <span className="font-serif-title text-base font-semibold text-ink-primary tracking-tight leading-none block">
                Winter Research Desk
              </span>
              <span className="text-[10px] text-ink-muted tracking-wide uppercase font-medium">
                Academic Portal
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-ink-muted hover:text-ink-primary rounded-md"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-white text-ink-primary shadow-subtle border border-stone-line'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-stone-hover'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-teal-700' : 'text-ink-muted group-hover:text-ink-primary'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.alert && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      <ShieldAlert className="w-3 h-3 text-amber-600" />
                      {item.alert} due
                    </span>
                  )}
                  {item.badge !== undefined && item.badge !== null && !item.alert && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-stone-hover text-ink-secondary border border-stone-line">
                      {item.badge}
                    </span>
                  )}
                  {item.tag && (
                    <span className="text-[10px] text-ink-muted font-mono">
                      {item.tag}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Workspace Status Box */}
        <div className="p-4 border-t border-stone-line bg-stone-hover/50">
          <div className="rounded-lg bg-white border border-stone-line p-3 shadow-subtle">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-ink-muted flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-600" />
                Local Workspace
              </span>
              <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-semibold">
                Saved Offline
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-1.5 bg-stone-hover/40 rounded border border-stone-line/60">
                <span className="block text-[10px] text-ink-muted">Applications</span>
                <span className="font-semibold text-ink-primary font-mono">{applications.length}</span>
              </div>
              <div className="p-1.5 bg-stone-hover/40 rounded border border-stone-line/60">
                <span className="block text-[10px] text-ink-muted">Saved Contacts</span>
                <span className="font-semibold text-ink-primary font-mono">{savedCount}</span>
              </div>
            </div>

            <p className="mt-2 text-[10px] text-ink-muted leading-tight text-center">
              No login required. Data is safely stored in this browser.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
