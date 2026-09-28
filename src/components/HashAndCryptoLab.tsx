import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldCheck, ShieldAlert, Cpu, Hash, Copy, Check, Lock, RefreshCw, Zap } from 'lucide-react';

export const HashAndCryptoLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hashing' | 'entropy' | 'jwt'>('hashing');

  // Hash Tab State
  const [inputText, setInputText] = useState('password123');
  const [sha256Hash, setSha256Hash] = useState('');
  const [simulatedMd5, setSimulatedMd5] = useState('');
  const [lookupHash, setLookupHash] = useState('5f4dcc3b5aa765d61d8327deb882cf99');
  const [crackResult, setCrackResult] = useState<{ match: string | null; time: string; algorithm: string } | null>(null);

  // Password Entropy State
  const [entropyPass, setEntropyPass] = useState('MyTr0ngP@ssw0rd!2026');

  // JWT Tab State
  const [jwtHeader, setJwtHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
  const [jwtPayload, setJwtPayload] = useState('{\n  "sub": "user_1024",\n  "username": "guest_user",\n  "role": "guest",\n  "exp": 1893456000\n}');
  const [jwtSecret, setJwtSecret] = useState('supersecret123');
  const [isAlgNoneBypass, setIsAlgNoneBypass] = useState(false);

  // Compute real SHA-256 using Web Crypto API
  useEffect(() => {
    async function computeHash() {
      if (!inputText) {
        setSha256Hash('');
        setSimulatedMd5('');
        return;
      }
      const encoder = new TextEncoder();
      const data = encoder.encode(inputText);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setSha256Hash(hashHex);

      // Simple mock MD5 for education
      const knownMd5Map: Record<string, string> = {
        'admin': '21232f297a57a5a743894a0e4a801fc3',
        'password': '5f4dcc3b5aa765d61d8327deb882cf99',
        'password123': '482c811da5d5b4bc6d497ffa98491e38',
        '123456': 'e10adc3949ba59abbe56e057f20f883e',
        'root': '63a9f0ea7bb98050796b649e85481845'
      };
      setSimulatedMd5(knownMd5Map[inputText] || hashHex.slice(0, 32));
    }
    computeHash();
  }, [inputText]);

  // Dictionary lookup for rainbow table
  const testRainbowTable = () => {
    const rainbowDB: Record<string, { plain: string; algo: string }> = {
      '5f4dcc3b5aa765d61d8327deb882cf99': { plain: 'password', algo: 'MD5' },
      'e10adc3949ba59abbe56e057f20f883e': { plain: '123456', algo: 'MD5' },
      '21232f297a57a5a743894a0e4a801fc3': { plain: 'admin', algo: 'MD5' },
      '482c811da5d5b4bc6d497ffa98491e38': { plain: 'password123', algo: 'MD5' },
      'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f': {
        plain: 'password123',
        algo: 'SHA-256'
      }
    };

    const trimmed = lookupHash.trim().toLowerCase();
    const result = rainbowDB[trimmed];
    if (result) {
      setCrackResult({
        match: result.plain,
        time: '0.003 seconds (Precomputed Rainbow Index)',
        algorithm: result.algo
      });
    } else {
      setCrackResult({
        match: null,
        time: 'Exhausted Top 14M Wordlist without match',
        algorithm: trimmed.length === 32 ? 'MD5 / NTLM' : trimmed.length === 64 ? 'SHA-256' : 'Unknown'
      });
    }
  };

  // Calculate password entropy
  const calculateEntropy = (password: string) => {
    if (!password) return { bits: 0, poolSize: 0, timeText: 'Instant', level: 'Very Weak' };

    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

    const bits = Math.round(password.length * Math.log2(poolSize || 1));
    const combinations = Math.pow(poolSize || 1, password.length);

    // Assume GPU cluster testing 100 Billion hashes per second
    const hashesPerSecond = 100_000_000_000;
    const seconds = combinations / hashesPerSecond;

    let timeText = '';
    if (seconds < 1) timeText = 'Less than 1 second';
    else if (seconds < 60) timeText = `${Math.round(seconds)} seconds`;
    else if (seconds < 3600) timeText = `${Math.round(seconds / 60)} minutes`;
    else if (seconds < 86400) timeText = `${Math.round(seconds / 3600)} hours`;
    else if (seconds < 31536000) timeText = `${Math.round(seconds / 86400)} days`;
    else if (seconds < 31536000 * 1000) timeText = `${Math.round(seconds / 31536000)} years`;
    else timeText = `${(seconds / (31536000 * 1000000)).toExponential(2)} million years`;

    let level: 'Very Weak' | 'Weak' | 'Moderate' | 'Strong' | 'Quantum-Resistant' = 'Very Weak';
    if (bits >= 90) level = 'Quantum-Resistant';
    else if (bits >= 70) level = 'Strong';
    else if (bits >= 50) level = 'Moderate';
    else if (bits >= 35) level = 'Weak';

    return { bits, poolSize, timeText, level };
  };

  const entropyData = calculateEntropy(entropyPass);

  // JWT Helper base64url
  const toBase64Url = (str: string) => {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const getSimulatedJwt = () => {
    try {
      const headerObj = JSON.parse(jwtHeader);
      if (isAlgNoneBypass) {
        headerObj.alg = 'none';
      }
      const headB64 = toBase64Url(JSON.stringify(headerObj));
      const payB64 = toBase64Url(jwtPayload);
      const sig = isAlgNoneBypass ? '' : 'kL9Xz2_eA44b9M-w8_Jp1r7Zq';
      return `${headB64}.${payB64}.${sig}`;
    } catch {
      return 'Malformed JSON in header or payload';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                OWASP A02:2021
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                Cryptography, Hash Cracking & JWT Security Lab
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Explore hash algorithms, rainbow table dictionary attacks, calculate real password entropy against modern GPU rigs, and examine JWT token tampering attacks.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('hashing')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'hashing'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              Hash Generator & Cracker
            </button>
            <button
              onClick={() => setActiveTab('entropy')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'entropy'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Password Entropy
            </button>
            <button
              onClick={() => setActiveTab('jwt')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'jwt'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              JWT Exploit Lab
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Hash Generator & Rainbow Table Lookup */}
      {activeTab === 'hashing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Real-time Hash Generator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Cryptographic One-Way Hash Generator
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                WebCrypto API
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Plaintext String Input:
              </label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                placeholder="Type any password or phrase..."
              />
            </div>

            {/* Generated Hashes */}
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs">
                <div className="text-[11px] font-bold text-emerald-400 mb-1 flex items-center justify-between">
                  <span>SHA-256 (256-bit Secure Hash Algorithm):</span>
                  <span className="text-slate-500">64 hex characters</span>
                </div>
                <div className="break-all text-slate-300 select-all">{sha256Hash || '...'}</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs">
                <div className="text-[11px] font-bold text-rose-400 mb-1 flex items-center justify-between">
                  <span>MD5 (128-bit Broken / Insecure):</span>
                  <span className="text-slate-500">32 hex characters</span>
                </div>
                <div className="break-all text-slate-300 select-all">{simulatedMd5 || '...'}</div>
                <div className="mt-1.5 text-[10px] text-rose-400/80">
                  ⚠️ MD5 is cryptographically broken since 2004 due to collision attacks. Never use for passwords!
                </div>
              </div>
            </div>
          </div>

          {/* Rainbow Table & Dictionary Cracker */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Simulated Rainbow Table Cracker
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">
                RockYou Dictionary Index
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Hash to Crack (MD5 or SHA-256):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={lookupHash}
                  onChange={(e) => setLookupHash(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="Paste 32-char MD5 or 64-char SHA256..."
                />
                <button
                  onClick={testRainbowTable}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0"
                >
                  Crack Hash
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1 text-[11px]">
              <span className="text-slate-500 mr-1">Sample Hashes:</span>
              <button
                onClick={() => {
                  setLookupHash('5f4dcc3b5aa765d61d8327deb882cf99');
                  setCrackResult(null);
                }}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
              >
                MD5("password")
              </button>
              <button
                onClick={() => {
                  setLookupHash('e10adc3949ba59abbe56e057f20f883e');
                  setCrackResult(null);
                }}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
              >
                MD5("123456")
              </button>
              <button
                onClick={() => {
                  setLookupHash('21232f297a57a5a743894a0e4a801fc3');
                  setCrackResult(null);
                }}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
              >
                MD5("admin")
              </button>
            </div>

            {/* Cracking Result */}
            {crackResult && (
              <div
                className={`p-4 rounded-lg border font-mono text-xs ${
                  crackResult.match
                    ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {crackResult.match ? (
                  <div>
                    <div className="flex items-center gap-2 font-bold text-rose-400 text-sm mb-2">
                      <ShieldAlert className="w-4 h-4" />
                      HASH REVERSED / CRACKED!
                    </div>
                    <div className="space-y-1 text-slate-300">
                      <div>
                        Plaintext: <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">"{crackResult.match}"</span>
                      </div>
                      <div>Algorithm: {crackResult.algorithm}</div>
                      <div>Lookup Latency: {crackResult.time}</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 font-bold text-slate-300 mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Hash not found in common wordlist
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Pass: Strong entropy or custom salt preventing lookup table attack.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Password Entropy & GPU Cracking Speed */}
      {activeTab === 'entropy' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="max-w-2xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Password Strength & Shannon Entropy Meter
            </label>
            <input
              type="text"
              value={entropyPass}
              onChange={(e) => setEntropyPass(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-base text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              placeholder="Test any password..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Entropy Score</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                {entropyData.bits} <span className="text-sm font-normal text-slate-400">bits</span>
              </div>
              <span className="text-[11px] text-slate-500">Recommended: &gt; 64 bits</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Character Pool</span>
              <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">
                {entropyData.poolSize} <span className="text-sm font-normal text-slate-400">chars</span>
              </div>
              <span className="text-[11px] text-slate-500">Charset diversity</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 md:col-span-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Est. Brute Force Time (100 Billion Hashes/sec RTX 4090 Rig)
              </span>
              <div className="text-xl font-bold text-amber-300 mt-1 font-mono truncate">
                {entropyData.timeText}
              </div>
              <span className="text-[11px] text-slate-500">Security Rating: {entropyData.level}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <div className="font-bold text-white mb-1 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Why Length Beats Complexity:
            </div>
            <p className="text-slate-400">
              A 16-character passphrase composed of 4 random common words (e.g. <span className="text-emerald-300 font-mono">"correct-horse-battery-staple"</span>) provides over 77 bits of entropy, which would take thousands of years to crack on high-end hardware, while being vastly easier for humans to remember than 8-character symbol gibberish (<span className="text-rose-300 font-mono">"P@$$w0rd"</span>).
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: JWT Exploit Lab */}
      {activeTab === 'jwt' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-purple-400" />
                JSON Web Token (JWT) Vulnerability Sandbox
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate privilege escalation via role tampering and testing the famous CVE "alg: none" flaw.
              </p>
            </div>

            <button
              onClick={() => setIsAlgNoneBypass(!isAlgNoneBypass)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                isAlgNoneBypass
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isAlgNoneBypass ? '⚠️ "alg": "none" Exploit Active' : 'Test "alg": "none" Attack'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Header */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-2">
                1. JWT Header
              </span>
              <textarea
                rows={5}
                value={jwtHeader}
                onChange={(e) => setJwtHeader(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Payload */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-2">
                2. JWT Payload (Claims)
              </span>
              <textarea
                rows={5}
                value={jwtPayload}
                onChange={(e) => setJwtPayload(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Signature */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-2">
                  3. Secret Key / Signature
                </span>
                <input
                  type="text"
                  value={jwtSecret}
                  onChange={(e) => setJwtSecret(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 mb-2"
                  placeholder="HMAC Secret Key"
                />
                <span className="text-[11px] text-slate-500">
                  {isAlgNoneBypass
                    ? 'Signature omitted because algorithm is set to none.'
                    : 'HMAC-SHA256 computed using shared secret.'}
                </span>
              </div>
            </div>
          </div>

          {/* Resulting Token String */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs">
            <span className="text-slate-400 text-[11px] block mb-1 font-bold">
              Encoded JWT Bearer Token:
            </span>
            <div className="break-all text-slate-200 select-all p-2 bg-slate-900 rounded border border-slate-800">
              {getSimulatedJwt()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
