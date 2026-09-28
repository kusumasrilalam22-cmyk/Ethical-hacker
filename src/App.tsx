/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Shield,
  Terminal as TerminalIcon,
  Database,
  Bug,
  Lock,
  Radar,
  Flag,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Github,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { Terminal } from './components/Terminal';
import { SqlInjectionLab } from './components/SqlInjectionLab';
import { XssLab } from './components/XssLab';
import { HashAndCryptoLab } from './components/HashAndCryptoLab';
import { NetworkReconLab } from './components/NetworkReconLab';
import { CtfChallengeBoard } from './components/CtfChallengeBoard';
import { SecurityHeaderAnalyzer } from './components/SecurityHeaderAnalyzer';
import { OwaspReference } from './components/OwaspReference';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'terminal' | 'sqli' | 'xss' | 'crypto' | 'network' | 'ctf' | 'headers' | 'owasp'
  >('terminal');

  const navItems = [
    { id: 'terminal', label: 'Terminal CLI', icon: TerminalIcon, badge: 'Interactive' },
    { id: 'sqli', label: 'SQL Injection', icon: Database, badge: 'A03 Lab' },
    { id: 'xss', label: 'XSS Playground', icon: Bug, badge: 'DOM / CSP' },
    { id: 'crypto', label: 'Crypto & Hashes', icon: Lock, badge: 'JWT / MD5' },
    { id: 'network', label: 'Network Recon', icon: Radar, badge: 'Nmap / CVE' },
    { id: 'ctf', label: 'CTF Arena', icon: Flag, badge: '5 Missions' },
    { id: 'headers', label: 'Header Auditor', icon: Shield, badge: 'Config Gen' },
    { id: 'owasp', label: 'OWASP & Tools', icon: BookOpen, badge: 'Cheatsheet' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Cyber Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
                <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black tracking-tight text-white text-base">
                    ETHICAL HACKING LAB
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                    v2.4 SEC-OPS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Interactive Defensive Security &amp; Penetration Testing Suite
                </p>
              </div>
            </div>

            {/* Quick Status Badges */}
            <div className="flex items-center gap-3 text-xs">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>SANDBOX: ISOLATED</span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[11px]">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>ENV: NODE 22 + VITE 8</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Bar Tabs */}
          <div className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-900 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      isActive
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800/80 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Ethical Disclaimer Warning */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-slate-200">Ethical Use Only:</strong> All labs and tools operate within an isolated safe sandbox for security education, penetration testing preparation, and defensive hardening.
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-[11px] text-slate-500">
            NIST SP 800-115 Compliant
          </span>
        </div>

        {/* Dynamic Tab Content */}
        {activeTab === 'terminal' && <Terminal />}
        {activeTab === 'sqli' && <SqlInjectionLab />}
        {activeTab === 'xss' && <XssLab />}
        {activeTab === 'crypto' && <HashAndCryptoLab />}
        {activeTab === 'network' && <NetworkReconLab />}
        {activeTab === 'ctf' && <CtfChallengeBoard />}
        {activeTab === 'headers' && <SecurityHeaderAnalyzer />}
        {activeTab === 'owasp' && <OwaspReference />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Ethical Hacking Lab &amp; Security Engineering Suite</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>OWASP Top 10 Reference</span>
            <span>•</span>
            <span>CVE Threat Intelligence</span>
            <span>•</span>
            <span>Defensive Hardening</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
