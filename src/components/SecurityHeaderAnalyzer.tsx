import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Copy, Check, Terminal, ExternalLink, RefreshCw } from 'lucide-react';

interface SecurityHeaderCheck {
  header: string;
  name: string;
  present: boolean;
  value: string;
  status: 'Pass' | 'Fail' | 'Warning';
  description: string;
  recommendation: string;
}

export const SecurityHeaderAnalyzer: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState('https://internal-portal.corp.net');
  const [serverType, setServerType] = useState<'nginx' | 'express' | 'apache' | 'caddy'>('nginx');
  const [copied, setCopied] = useState(false);

  // Simulated header audit results
  const [headers, setHeaders] = useState<SecurityHeaderCheck[]>([
    {
      header: 'Strict-Transport-Security',
      name: 'HSTS',
      present: true,
      value: 'max-age=31536000; includeSubDomains; preload',
      status: 'Pass',
      description: 'Enforces secure HTTPS connections and eliminates SSL-stripping attacks.',
      recommendation: 'max-age=63072000; includeSubDomains; preload'
    },
    {
      header: 'Content-Security-Policy',
      name: 'CSP',
      present: false,
      value: 'Not Set',
      status: 'Fail',
      description: 'Restricts resource loading (scripts, images, styles) to prevent XSS and data exfiltration.',
      recommendation: "default-src 'self'; script-src 'self' https://trusted.cdn.com; object-src 'none';"
    },
    {
      header: 'X-Frame-Options',
      name: 'Clickjacking Protection',
      present: true,
      value: 'DENY',
      status: 'Pass',
      description: 'Prevents the website from being embedded inside an iframe on malicious sites.',
      recommendation: 'DENY or SAMEORIGIN'
    },
    {
      header: 'X-Content-Type-Options',
      name: 'MIME-Sniffing Guard',
      present: true,
      value: 'nosniff',
      status: 'Pass',
      description: 'Forces browsers to adhere to declared Content-Type, mitigating MIME confusion exploits.',
      recommendation: 'nosniff'
    },
    {
      header: 'Referrer-Policy',
      name: 'Referrer Privacy',
      present: false,
      value: 'Not Set',
      status: 'Warning',
      description: 'Controls how much referrer information (like internal query params) is leaked in outbound links.',
      recommendation: 'strict-origin-when-cross-origin'
    },
    {
      header: 'Permissions-Policy',
      name: 'Browser Hardware Permissions',
      present: false,
      value: 'Not Set',
      status: 'Warning',
      description: 'Restricts access to device features like camera, microphone, geolocation, and USB.',
      recommendation: 'camera=(), microphone=(), geolocation=()'
    }
  ]);

  const passCount = headers.filter((h) => h.status === 'Pass').length;
  const grade = passCount >= 5 ? 'A' : passCount >= 3 ? 'B' : passCount >= 2 ? 'C' : 'F';

  const generateConfigSnippet = () => {
    switch (serverType) {
      case 'nginx':
        return `# Nginx Production Hardening Block
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none';" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
server_tokens off;`;

      case 'express':
        return `// Node.js Express with Helmet
import helmet from 'helmet';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);`;

      case 'apache':
        return `# Apache .htaccess / VirtualHost Security Headers
<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none';"
  Header always set X-Frame-Options "DENY"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>`;

      case 'caddy':
        return `# Caddyfile Security Headers
header {
  Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none';"
  X-Frame-Options "DENY"
  X-Content-Type-Options "nosniff"
  Referrer-Policy "strict-origin-when-cross-origin"
  Permissions-Policy "camera=(), microphone=(), geolocation=()"
  -Server
}`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateConfigSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                Infrastructure Defense
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                HTTP Security Headers Auditor & Config Generator
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Analyze critical HTTP response headers protecting against Clickjacking, MIME sniffing, and Cross-Site Scripting, and generate hardened configs.
            </p>
          </div>

          {/* Letter Grade */}
          <div className="flex items-center gap-4 bg-slate-950 px-5 py-3 rounded-xl border border-slate-800 self-start md:self-auto">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Security Grade</span>
              <span
                className={`text-3xl font-black font-mono ${
                  grade === 'A'
                    ? 'text-emerald-400'
                    : grade === 'B'
                    ? 'text-cyan-400'
                    : grade === 'C'
                    ? 'text-amber-400'
                    : 'text-rose-500'
                }`}
              >
                {grade}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Passed</span>
              <span className="text-lg font-bold text-slate-200 font-mono">
                {passCount} / {headers.length}
              </span>
            </div>
          </div>
        </div>

        {/* Input Target */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            placeholder="https://example.com"
          />
          <button
            onClick={() => {}}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Audit Headers
          </button>
        </div>
      </div>

      {/* Header Audit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {headers.map((h) => (
          <div
            key={h.header}
            className={`p-4 rounded-xl border bg-slate-900 transition-colors ${
              h.status === 'Pass'
                ? 'border-emerald-900/50 hover:border-emerald-700/60'
                : h.status === 'Warning'
                ? 'border-amber-900/50 hover:border-amber-700/60'
                : 'border-rose-900/50 hover:border-rose-700/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">{h.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  h.status === 'Pass'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : h.status === 'Warning'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {h.status}
              </span>
            </div>

            <div className="text-[11px] font-mono text-cyan-400 mb-2 truncate" title={h.header}>
              {h.header}
            </div>

            <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-slate-300 break-all mb-2">
              {h.value}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              {h.description}
            </p>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
              <span className="font-semibold text-slate-400 block mb-0.5">Recommended Value:</span>
              <code className="text-emerald-400 break-all">{h.recommendation}</code>
            </div>
          </div>
        ))}
      </div>

      {/* Production Hardening Snippet Generator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Production Configuration Generator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Copy-paste ready security header configurations for your deployment stack.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {(['nginx', 'express', 'apache', 'caddy'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setServerType(s)}
                  className={`px-2.5 py-1 rounded capitalize font-semibold transition-colors ${
                    serverType === s ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
          {generateConfigSnippet()}
        </pre>
      </div>
    </div>
  );
};
