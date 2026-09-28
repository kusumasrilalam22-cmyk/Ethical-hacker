import React, { useState } from 'react';
import { Bug, ShieldCheck, ShieldAlert, AlertOctagon, Terminal, Copy, Check, Eye, Code2 } from 'lucide-react';

export const XssLab: React.FC = () => {
  const [xssType, setXssType] = useState<'reflected' | 'stored' | 'dom'>('reflected');
  const [payload, setPayload] = useState('<img src="invalid" onerror="alert(\'XSS Vulnerability Triggered!\')">');
  const [defenseMode, setDefenseMode] = useState<'none' | 'naive' | 'encoded' | 'csp'>('none');
  const [alertLogs, setAlertLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Stored posts mock
  const [storedPosts, setStoredPosts] = useState<string[]>([
    'Welcome to the cybersecurity community forum!',
    'Does anyone have tips for CEH v12 certification?',
  ]);

  const xssPresets = [
    {
      label: 'Image OnError (Classic)',
      code: '<img src="x" onerror="alert(\'XSS: Session Hijacked!\')">'
    },
    {
      label: 'SVG OnLoad',
      code: '<svg onload="alert(\'XSS SVG Triggered!\')">'
    },
    {
      label: 'JavaScript URI',
      code: '<a href="javascript:alert(\'Credential Phished!\')" class="text-blue-400 underline">Click to Claim Prize</a>'
    },
    {
      label: 'Script Tag',
      code: '<script>alert("Cookie: " + document.cookie)</script>'
    },
    {
      label: 'Case Variation Filter Bypass',
      code: '<sCrIpt>alert("Naive Regex Bypassed!")</sCrIpt>'
    }
  ];

  // Apply defense logic
  const sanitizeOrFilter = (input: string) => {
    if (defenseMode === 'none') {
      return {
        processed: input,
        blocked: false,
        technique: 'No protection: Raw string rendered into DOM directly.'
      };
    }

    if (defenseMode === 'naive') {
      // Naive filter: only removes lowercase <script> and </script>
      const filtered = input.replace(/<script>/g, '').replace(/<\/script>/g, '');
      const stillVulnerable =
        filtered.toLowerCase().includes('onerror=') ||
        filtered.toLowerCase().includes('onload=') ||
        filtered.toLowerCase().includes('javascript:') ||
        filtered.includes('<sCrIpt>') ||
        filtered.toLowerCase().includes('<script');

      return {
        processed: filtered,
        blocked: !stillVulnerable && filtered !== input,
        technique: 'Naive Regex Filter (replace /<script>/g): Easily bypassed by <img> onerror, <svg onload>, or mixed case!'
      };
    }

    if (defenseMode === 'encoded') {
      // Full HTML Entity Encoding
      const encoded = input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      return {
        processed: encoded,
        blocked: true,
        technique: 'HTML Entity Encoding: Special characters (&, <, >, ", \') are converted to safe representations.'
      };
    }

    if (defenseMode === 'csp') {
      // CSP Mode: script-src 'self'
      return {
        processed: input,
        blocked: true,
        cspViolation: true,
        technique: "Content Security Policy (CSP): script-src 'self'; Denied inline script execution and inline event handlers!"
      };
    }

    return { processed: input, blocked: false, technique: '' };
  };

  const currentResult = sanitizeOrFilter(payload);

  const simulateExecution = () => {
    const hasScriptExecution =
      (payload.includes('onerror=') ||
        payload.includes('onload=') ||
        payload.includes('javascript:') ||
        payload.toLowerCase().includes('<script>')) &&
      defenseMode !== 'encoded' &&
      defenseMode !== 'csp';

    if (hasScriptExecution) {
      const log = `[ALERT] ${new Date().toLocaleTimeString()} - Script executed: ${payload.slice(0, 45)}...`;
      setAlertLogs((prev) => [log, ...prev.slice(0, 4)]);
    } else if (defenseMode === 'csp') {
      const log = `[CSP VIOLATION] ${new Date().toLocaleTimeString()} - Refused to execute inline event handler because it violates Content Security Policy: "script-src 'self'"`;
      setAlertLogs((prev) => [log, ...prev.slice(0, 4)]);
    }
  };

  const handleAddStored = () => {
    simulateExecution();
    setStoredPosts((prev) => [...prev, payload]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                OWASP A03 / Client-Side Injection
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Bug className="w-5 h-5 text-amber-400" />
                Cross-Site Scripting (XSS) Playground
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Test how untrusted input gets executed in the victim’s browser, learn the differences between Reflected, Stored, and DOM XSS, and verify defensive mitigations like CSP.
            </p>
          </div>

          {/* Defense selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Active Defense:</span>
            <select
              value={defenseMode}
              onChange={(e) => setDefenseMode(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-400"
            >
              <option value="none">⚠️ None (Raw innerHTML)</option>
              <option value="naive">⚡ Naive Regex Filter (/&lt;script&gt;/)</option>
              <option value="encoded">🛡️ HTML Entity Encoding</option>
              <option value="csp">🔒 Strict CSP (script-src 'self')</option>
            </select>
          </div>
        </div>

        {/* Tab selection for Reflected / Stored / DOM */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setXssType('reflected')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                xssType === 'reflected'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Reflected XSS
            </button>
            <button
              onClick={() => setXssType('stored')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                xssType === 'stored'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Stored (Persistent) XSS
            </button>
            <button
              onClick={() => setXssType('dom')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                xssType === 'dom'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              DOM-Based XSS
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500">Presets:</span>
            {xssPresets.map((p, i) => (
              <button
                key={i}
                onClick={() => setPayload(p.code)}
                className="text-[11px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Payload Input */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {xssType === 'reflected'
                ? 'URL Search Parameter (?q=)'
                : xssType === 'stored'
                ? 'Forum Post Comment Box'
                : 'Client-side location.hash'}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              Payload Injector
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Malicious or Test Payload:
            </label>
            <textarea
              rows={4}
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
              placeholder="Enter HTML or JavaScript payload..."
            />
          </div>

          <div className="flex items-center gap-2">
            {xssType === 'stored' ? (
              <button
                onClick={handleAddStored}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-colors"
              >
                Save Post into Database (Stored XSS)
              </button>
            ) : (
              <button
                onClick={simulateExecution}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" />
                Render & Trigger Execution
              </button>
            )}
          </div>

          {/* Defense status callout */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <div className="text-slate-400 font-semibold mb-1">Defense Analysis:</div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              {currentResult.technique}
            </div>
          </div>
        </div>

        {/* Right Side: Simulated Victim Browser DOM */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Simulated Victim Browser Viewport
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {defenseMode === 'csp' ? "CSP: script-src 'self'" : 'Default Web Context'}
              </span>
            </div>

            {/* Browser Preview Window */}
            <div className="mt-4 bg-slate-950 rounded-lg border border-slate-800 p-4 min-h-[160px]">
              {xssType === 'reflected' && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 mb-2">Search Results:</h4>
                  <div className="text-xs text-slate-200">
                    Showing results for:{' '}
                    {defenseMode === 'encoded' ? (
                      <span className="bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                        {currentResult.processed}
                      </span>
                    ) : (
                      <span
                        className="bg-amber-950/60 text-amber-300 px-2 py-0.5 rounded border border-amber-800 font-mono"
                        dangerouslySetInnerHTML={{ __html: currentResult.processed }}
                      />
                    )}
                  </div>
                </div>
              )}

              {xssType === 'stored' && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 mb-2">Community Forum Threads:</h4>
                  <div className="space-y-2">
                    {storedPosts.map((post, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900 rounded border border-slate-800 text-xs">
                        <div className="text-[10px] text-slate-500 font-mono mb-1">
                          User #{idx + 104} • {new Date().toLocaleDateString()}
                        </div>
                        {defenseMode === 'encoded' ? (
                          <div className="text-slate-300 font-mono">{post}</div>
                        ) : (
                          <div
                            className="text-slate-200"
                            dangerouslySetInnerHTML={{ __html: post }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {xssType === 'dom' && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 mb-2">
                    DOM Sink: document.getElementById('welcome').innerHTML = window.location.hash
                  </h4>
                  <div className="p-3 bg-slate-900 rounded border border-slate-800 text-xs">
                    <span className="text-slate-400">Welcome, </span>
                    <span
                      id="welcome"
                      className="font-bold text-amber-300"
                      dangerouslySetInnerHTML={{
                        __html: defenseMode === 'encoded' ? currentResult.processed : payload
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Alert Event Interceptor Console */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  Simulated Browser Alert & Execution Log:
                </span>
                {alertLogs.length > 0 && (
                  <button
                    onClick={() => setAlertLogs([])}
                    className="text-[11px] text-slate-500 hover:text-slate-300"
                  >
                    Clear Logs
                  </button>
                )}
              </div>

              {alertLogs.length > 0 ? (
                <div className="space-y-1.5 font-mono text-[11px]">
                  {alertLogs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded border ${
                        log.includes('CSP VIOLATION')
                          ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-600 font-mono py-2">
                  No script execution events detected yet. Click "Render & Trigger Execution".
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Prevention & Remediation Guidelines */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Cross-Site Scripting (XSS) Defenses in Production
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <h4 className="font-bold text-emerald-400 mb-1">1. Context-Aware Encoding</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Use standard libraries like DOMPurify or framework auto-escaping (React JSX `{}` automatically encodes strings; avoid `dangerouslySetInnerHTML`).
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <h4 className="font-bold text-emerald-400 mb-1">2. Content Security Policy (CSP)</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Deploy HTTP header <code className="text-amber-300">Content-Security-Policy: default-src 'self'</code> with nonces or hashes. Disables inline scripts and unauthorized external scripts.
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <h4 className="font-bold text-emerald-400 mb-1">3. HttpOnly Session Cookies</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Mark sensitive authentication tokens with the <code className="text-amber-300">HttpOnly</code> attribute so client-side JavaScript cannot read <code className="text-amber-300">document.cookie</code> even if XSS occurs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
