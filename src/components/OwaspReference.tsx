import React, { useState } from 'react';
import { BookOpen, ShieldAlert, ShieldCheck, Terminal, Search, ExternalLink, Copy, Check, Wrench, Code } from 'lucide-react';
import { OWASP_TOP_10, PENTEST_TOOLS, Vulnerability } from '../data/ethicalHackingData';

export const OwaspReference: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'owasp' | 'tools'>('owasp');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability>(OWASP_TOP_10[0]);
  const [codeTab, setCodeTab] = useState<'vulnerable' | 'secure'>('vulnerable');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const filteredVulns = OWASP_TOP_10.filter(
    (v) =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTools = PENTEST_TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-950 text-indigo-400 border border-indigo-800">
                Knowledge Base &amp; Methodology
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                OWASP Top 10 &amp; Pentesting Tooling Guide
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Authoritative security reference for web application vulnerabilities, real-world CVE examples, and penetration testing command syntax.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveSection('owasp')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeSection === 'owasp' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              OWASP Top 10
            </button>
            <button
              onClick={() => setActiveSection('tools')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeSection === 'tools' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Pentest Tools
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="mt-4 pt-4 border-t border-slate-800 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-7" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vulnerabilities, CVEs, tools, or techniques..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Section 1: OWASP TOP 10 */}
      {activeSection === 'owasp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left List */}
          <div className="lg:col-span-5 space-y-2">
            {filteredVulns.map((vuln) => (
              <div
                key={vuln.id}
                onClick={() => setSelectedVuln(vuln)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedVuln.id === vuln.id
                    ? 'bg-indigo-950/40 border-indigo-500/70 text-white'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-indigo-400">{vuln.code}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      vuln.severity === 'Critical'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {vuln.severity}
                  </span>
                </div>
                <h4 className="text-sm font-bold">{vuln.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {vuln.description}
                </p>
              </div>
            ))}
          </div>

          {/* Right Detail Pane */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-indigo-400">{selectedVuln.code}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {selectedVuln.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{selectedVuln.title}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {selectedVuln.description}
              </p>
            </div>

            {/* Attack Vector */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <span className="font-bold text-rose-400 block mb-1">Attack Vector:</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">{selectedVuln.attackVector}</p>
            </div>

            {/* CVE Examples */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Notable Real-World CVE Incidents:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedVuln.cveExamples.map((cve) => (
                  <span
                    key={cve}
                    className="text-xs px-2.5 py-1 bg-slate-950 border border-slate-800 rounded font-mono text-cyan-400"
                  >
                    {cve}
                  </span>
                ))}
              </div>
            </div>

            {/* Vulnerable vs Secure Code Tabs */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCodeTab('vulnerable')}
                    className={`text-xs px-3 py-1 rounded font-semibold transition-colors ${
                      codeTab === 'vulnerable'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Vulnerable Implementation
                  </button>
                  <button
                    onClick={() => setCodeTab('secure')}
                    className={`text-xs px-3 py-1 rounded font-semibold transition-colors ${
                      codeTab === 'secure'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Remediated Implementation
                  </button>
                </div>
              </div>

              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono overflow-x-auto text-slate-200 leading-relaxed">
                {codeTab === 'vulnerable' ? selectedVuln.vulnerableCode : selectedVuln.secureCode}
              </pre>
            </div>

            {/* Mitigations */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Required Security Controls:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedVuln.mitigation.map((m, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Pentest Tools Cheatsheet */}
      {activeSection === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTools.map((tool) => (
            <div key={tool.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono font-semibold uppercase">
                    {tool.category}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{tool.name}</h3>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{tool.description}</p>

              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Practical Command Syntax:
                </span>
                {tool.examples.map((ex, i) => (
                  <div key={i} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-slate-300">{ex.title}</span>
                      <button
                        onClick={() => handleCopy(ex.command)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
                      >
                        {copiedCmd === ex.command ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copiedCmd === ex.command ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <code className="text-emerald-400 font-mono text-[11px] block break-all mb-1 select-all">
                      {ex.command}
                    </code>
                    <p className="text-[10px] text-slate-500">{ex.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
