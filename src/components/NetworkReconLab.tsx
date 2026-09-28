import React, { useState } from 'react';
import { Radar, ShieldAlert, ShieldCheck, Server, AlertTriangle, Play, RefreshCw, Cpu, Activity, ExternalLink } from 'lucide-react';

interface ScannedPort {
  port: number;
  protocol: 'TCP' | 'UDP';
  service: string;
  version: string;
  state: 'open' | 'closed' | 'filtered';
  cve?: string;
  risk: 'Critical' | 'High' | 'Medium' | 'Low';
  details: string;
}

interface TargetProfile {
  id: string;
  name: string;
  ip: string;
  type: string;
  ports: ScannedPort[];
}

export const NetworkReconLab: React.FC = () => {
  const targets: TargetProfile[] = [
    {
      id: 'target-1',
      name: 'Legacy Corporate File Server',
      ip: '192.168.1.10',
      type: 'Windows Server 2012 R2',
      ports: [
        {
          port: 21,
          protocol: 'TCP',
          service: 'ftp',
          version: 'vsftpd 2.3.4 (Backdoored)',
          state: 'open',
          cve: 'CVE-2011-2523',
          risk: 'Critical',
          details: 'Contains smiley face backdoor leading to immediate root shell execution on port 6200.'
        },
        {
          port: 22,
          protocol: 'TCP',
          service: 'ssh',
          version: 'OpenSSH 7.2p2',
          state: 'open',
          cve: 'CVE-2016-6210',
          risk: 'Medium',
          details: 'User enumeration possible via timing attack on invalid usernames.'
        },
        {
          port: 80,
          protocol: 'TCP',
          service: 'http',
          version: 'Apache httpd 2.4.18',
          state: 'open',
          risk: 'Low',
          details: 'Default Ubuntu Apache landing page exposed. Leaking server version in Server banner.'
        },
        {
          port: 445,
          protocol: 'TCP',
          service: 'microsoft-ds (SMB)',
          version: 'Windows SMBv1',
          state: 'open',
          cve: 'CVE-2017-0144 (EternalBlue)',
          risk: 'Critical',
          details: 'SMBv1 buffer overflow vulnerability allowing arbitrary remote code execution (WannaCry vector).'
        }
      ]
    },
    {
      id: 'target-2',
      name: 'Industrial Surveillance IoT Camera',
      ip: '10.0.0.45',
      type: 'Embedded Linux (ARM)',
      ports: [
        {
          port: 23,
          protocol: 'TCP',
          service: 'telnet',
          version: 'BusyBox telnetd',
          state: 'open',
          risk: 'Critical',
          details: 'Cleartext management console with default root credentials (root / root) active.'
        },
        {
          port: 80,
          protocol: 'TCP',
          service: 'http',
          version: 'GoAhead-Webs 2.5',
          state: 'open',
          cve: 'CVE-2017-17562',
          risk: 'High',
          details: 'CGI environment parameter injection leading to remote arbitrary code execution.'
        },
        {
          port: 554,
          protocol: 'TCP',
          service: 'rtsp',
          version: 'Live555 Streaming Media',
          state: 'open',
          risk: 'Medium',
          details: 'Unauthenticated video feed broadcast without stream encryption.'
        }
      ]
    },
    {
      id: 'target-3',
      name: 'Cloud Microservice & In-Memory Cache',
      ip: 'app.fintech-demo.internal',
      type: 'Debian Container Cluster',
      ports: [
        {
          port: 80,
          protocol: 'TCP',
          service: 'http',
          version: 'nginx 1.24.0',
          state: 'open',
          risk: 'Low',
          details: 'HTTP reverse proxy forwarding to upstream microservices.'
        },
        {
          port: 443,
          protocol: 'TCP',
          service: 'https',
          version: 'nginx 1.24.0 (TLS 1.3)',
          state: 'open',
          risk: 'Low',
          details: 'Properly configured TLS cipher suites and HSTS enabled.'
        },
        {
          port: 6379,
          protocol: 'TCP',
          service: 'redis',
          version: 'Redis server v=6.0.9',
          state: 'open',
          cve: 'CVE-2022-0543',
          risk: 'Critical',
          details: 'Exposed Redis database without AUTH password! Attacker can write SSH authorized_keys to disk.'
        }
      ]
    }
  ];

  const [selectedTargetId, setSelectedTargetId] = useState(targets[0].id);
  const [scanType, setScanType] = useState<'syn' | 'aggressive' | 'vuln'>('aggressive');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanCompleted, setScanCompleted] = useState(true);

  const currentTarget = targets.find((t) => t.id === selectedTargetId) || targets[0];

  const runScan = () => {
    setIsScanning(true);
    setProgress(0);
    setScanCompleted(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanCompleted(true);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
                Network Security & Reconnaissance
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Radar className="w-5 h-5 text-cyan-400" />
                Network Recon & Port Scanner Simulator
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Simulate enterprise-grade Nmap network probing, discover open service banners, and correlate exposed ports with historical CVE vulnerabilities.
            </p>
          </div>

          <button
            onClick={runScan}
            disabled={isScanning}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-2 self-start md:self-auto"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Scanning Host... {progress}%
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Execute Nmap Scan
              </>
            )}
          </button>
        </div>

        {/* Scan Parameters */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Host System:</label>
            <select
              value={selectedTargetId}
              onChange={(e) => {
                setSelectedTargetId(e.target.value);
                setScanCompleted(false);
              }}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-400"
            >
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.ip} ({t.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Scan Methodology:</label>
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-400"
            >
              <option value="syn">SYN Stealth Scan (-sS) — Fast &amp; Stealthy</option>
              <option value="aggressive">Aggressive Fingerprint (-A -sV -sC) — Deep Probing</option>
              <option value="vuln">NSE Vulnerability Scripts (--script vuln)</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 font-mono flex items-center justify-between">
              <span>Command:</span>
              <span className="text-cyan-400 font-bold">
                nmap {scanType === 'syn' ? '-sS' : scanType === 'aggressive' ? '-sV -sC -A' : '--script vuln'} {currentTarget.ip}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar when scanning */}
      {isScanning && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>SYN Probe in progress... sending TCP SYN packets across 1,000 standard ports</span>
            <span className="text-cyan-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Host Summary Card */}
      {scanCompleted && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Host Status</span>
            <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              UP (Latency 12ms)
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Fingerprinted OS</span>
            <div className="text-sm font-bold text-slate-200 mt-1 truncate">
              {currentTarget.type}
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Open Port Count</span>
            <div className="text-lg font-bold text-cyan-400 mt-1 font-mono">
              {currentTarget.ports.filter((p) => p.state === 'open').length} Exposed
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Critical CVEs</span>
            <div className="text-lg font-bold text-rose-400 mt-1 font-mono">
              {currentTarget.ports.filter((p) => p.risk === 'Critical').length} Critical Alerts
            </div>
          </div>
        </div>
      )}

      {/* Ports & Vulnerability Details Table */}
      {scanCompleted && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              Discovered Services, Banners & Threat Intelligence
            </h3>
            <span className="text-xs text-slate-500 font-mono">Target: {currentTarget.ip}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Port / Protocol</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Detected Version</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3">Vulnerability / CVE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentTarget.ports.map((portItem) => (
                  <tr key={portItem.port} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-cyan-400">
                      {portItem.port}/{portItem.protocol.toLowerCase()}
                    </td>
                    <td className="py-3 px-3 uppercase text-slate-300 font-semibold">{portItem.service}</td>
                    <td className="py-3 px-3 text-slate-200">{portItem.version}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          portItem.risk === 'Critical'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : portItem.risk === 'High'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {portItem.risk}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {portItem.cve ? (
                        <div className="space-y-1">
                          <span className="text-rose-400 font-bold underline cursor-pointer">
                            {portItem.cve}
                          </span>
                          <p className="text-[11px] text-slate-400 font-sans max-w-md">{portItem.details}</p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 font-sans max-w-md">{portItem.details}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
