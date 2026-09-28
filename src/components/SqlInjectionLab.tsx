import React, { useState } from 'react';
import { Database, ShieldAlert, ShieldCheck, AlertTriangle, Play, Sparkles, Terminal, Copy, Check } from 'lucide-react';

interface MockUser {
  id: number;
  username: string;
  role: string;
  email: string;
}

export const SqlInjectionLab: React.FC = () => {
  const [username, setUsername] = useState("admin' --");
  const [password, setPassword] = useState('anything');
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock DB records
  const mockDatabase: MockUser[] = [
    { id: 1, username: 'admin', role: 'SuperAdministrator', email: 'admin@corp-internal.com' },
    { id: 2, username: 'alice', role: 'StaffEngineer', email: 'alice@corp-internal.com' },
    { id: 3, username: 'bob', role: 'FinancialAuditor', email: 'bob@corp-internal.com' }
  ];

  // Evaluate query outcome
  const computeQueryAndResult = () => {
    if (isSecureMode) {
      // Secure mode: uses parameterized query
      const sqlRepresentation = `SELECT id, username, role, email FROM users WHERE username = ? AND password = ?;`;
      const params = [username, password];

      // Safe matching: exact match only
      const matched = mockDatabase.filter(
        (u) =>
          u.username.toLowerCase() === username.toLowerCase() &&
          ((username === 'admin' && password === 'admin@123') ||
            (username === 'alice' && password === 'alice2024') ||
            (username === 'bob' && password === 'audit#pass'))
      );

      return {
        sql: sqlRepresentation,
        params,
        matched,
        isBypassed: false,
        explanation: 'Parameterized query: User input is treated strictly as literal data, never executed as SQL code.'
      };
    } else {
      // Vulnerable mode: string concatenation
      const rawSql = `SELECT id, username, role, email FROM users WHERE username = '${username}' AND password = '${password}';`;

      // Check if username injects an auth bypass
      const isCommentBypass =
        username.includes("' --") ||
        username.includes("' #") ||
        username.includes("admin' --") ||
        username.includes("admin'/*");

      const isTautology =
        username.toLowerCase().includes("' or '1'='1") ||
        username.toLowerCase().includes("' or 1=1") ||
        password.toLowerCase().includes("' or '1'='1") ||
        password.toLowerCase().includes("' or 1=1");

      const isUnion = username.toLowerCase().includes('union select');

      let matched: MockUser[] = [];
      let isBypassed = false;
      let explanation = '';

      if (isCommentBypass) {
        // Comments out password check! Returns first matching user (admin)
        matched = [mockDatabase[0]];
        isBypassed = true;
        explanation = 'Comment injection (-- or #): The SQL parser ignores everything after the double dash, completely skipping the password verification clause!';
      } else if (isTautology) {
        // OR 1=1 always true: returns all records
        matched = mockDatabase;
        isBypassed = true;
        explanation = "Tautology (' OR 1=1): The logical OR condition evaluates to TRUE for every row in the database table, dumping all users.";
      } else if (isUnion) {
        matched = [
          ...mockDatabase,
          { id: 99, username: 'INJECTED_DUMP', role: 'ROOT_PWNED', email: 'cve@exploit.net' }
        ];
        isBypassed = true;
        explanation = 'UNION Injection: Merged unauthorized dataset into query result set.';
      } else {
        // Normal check
        matched = mockDatabase.filter(
          (u) =>
            u.username.toLowerCase() === username.toLowerCase() &&
            ((username === 'admin' && password === 'admin@123') ||
              (username === 'alice' && password === 'alice2024') ||
              (username === 'bob' && password === 'audit#pass'))
        );
        explanation = matched.length > 0 ? 'Legitimate user authenticated successfully.' : 'Authentication failed: Invalid credentials.';
      }

      return {
        sql: rawSql,
        params: [],
        matched,
        isBypassed,
        explanation
      };
    }
  };

  const currentResult = computeQueryAndResult();

  const presets = [
    { label: "Classic Comment: admin' --", u: "admin' --", p: "fake_pass" },
    { label: "Tautology: ' OR '1'='1", u: "' OR '1'='1", p: "' OR '1'='1" },
    { label: "Inline Comment: ' OR 1=1 #", u: "' OR 1=1 #", p: "test" },
    { label: "Valid User: alice", u: "alice", p: "alice2024" },
    { label: "UNION Dump", u: "' UNION SELECT 1, 'hacked', 'dump', 'admin' --", p: "none" }
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-950 text-rose-400 border border-rose-800">
                OWASP A03:2021
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-rose-400" />
                SQL Injection (SQLi) Interactive Sandbox
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Explore how malicious payloads manipulate raw database queries, bypass authentication filters, and test how Prepared Statements neutralize the vulnerability.
            </p>
          </div>

          {/* Toggle Vulnerable vs Secure Mode */}
          <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-lg border border-slate-800 self-start md:self-auto">
            <span className={`text-xs font-semibold ${!isSecureMode ? 'text-rose-400' : 'text-slate-500'}`}>
              Vulnerable (Concatenation)
            </span>
            <button
              onClick={() => setIsSecureMode(!isSecureMode)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                isSecureMode ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isSecureMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-semibold ${isSecureMode ? 'text-emerald-400' : 'text-slate-500'}`}>
              Secured (Prepared Statement)
            </span>
          </div>
        </div>

        {/* Payload Presets */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Attack Presets:</span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUsername(preset.u);
                setPassword(preset.p);
                setHasRun(true);
              }}
              className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Terminal className="w-3 h-3 text-rose-400" />
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Target Web Application */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Application: Login Gateway</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">POST /api/v1/auth/login</span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Username or Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setHasRun(true);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-rose-500"
                  placeholder="e.g. admin' --"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setHasRun(true);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-rose-500"
                  placeholder="Password"
                />
              </div>

              <button
                onClick={() => setHasRun(true)}
                className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                  isSecureMode
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                <Play className="w-4 h-4" />
                Submit Authentication Request
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-1">Legitimate Test Accounts:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-400 font-mono text-[11px]">
              <li>alice / alice2024</li>
              <li>admin / admin@123</li>
              <li>bob / audit#pass</li>
            </ul>
          </div>
        </div>

        {/* Right Panel: SQL Query Breakdown & Database Output */}
        <div className="lg:col-span-7 space-y-4">
          {/* Query Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live SQL Query Construction
              </span>
              <button
                onClick={() => handleCopy(currentResult.sql)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy SQL'}
              </button>
            </div>

            <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs overflow-x-auto">
              {!isSecureMode ? (
                <div>
                  <span className="text-purple-400 font-bold">SELECT</span> id, username, role, email{' '}
                  <span className="text-purple-400 font-bold">FROM</span> users{' '}
                  <span className="text-purple-400 font-bold">WHERE</span> username = '
                  <span className="text-rose-400 font-bold bg-rose-950/60 px-1 py-0.5 rounded border border-rose-800">
                    {username}
                  </span>
                  ' <span className="text-purple-400 font-bold">AND</span> password = '
                  <span className="text-amber-400">{password}</span>';
                </div>
              ) : (
                <div>
                  <div className="text-emerald-400">
                    <span className="text-purple-400 font-bold">PREPARED: </span>
                    SELECT id, username, role, email FROM users WHERE username = <span className="font-bold">?</span> AND password = <span className="font-bold">?</span>;
                  </div>
                  <div className="mt-2 text-slate-400 text-[11px]">
                    BOUND_PARAMS: [1: <span className="text-emerald-300">"{username}"</span>, 2: <span className="text-emerald-300">"{password}"</span>]
                  </div>
                </div>
              )}
            </div>

            {/* Attack Outcome Banner */}
            <div
              className={`mt-4 p-3.5 rounded-lg border flex items-start gap-3 ${
                currentResult.isBypassed
                  ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                  : isSecureMode
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                  : currentResult.matched.length > 0
                  ? 'bg-blue-950/40 border-blue-800/80 text-blue-200'
                  : 'bg-slate-800/40 border-slate-700 text-slate-300'
              }`}
            >
              {currentResult.isBypassed ? (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : isSecureMode ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <div className="font-bold mb-0.5">
                  {currentResult.isBypassed
                    ? 'SECURITY VULNERABILITY EXPLOITED: AUTHENTICATION BYPASS!'
                    : isSecureMode
                    ? 'ATTACK NEUTRALIZED BY PARAMETERIZED BINDING'
                    : currentResult.matched.length > 0
                    ? 'AUTHENTICATION SUCCESSFUL'
                    : 'AUTHENTICATION REJECTED'}
                </div>
                <p className="text-slate-300 leading-relaxed">{currentResult.explanation}</p>
              </div>
            </div>
          </div>

          {/* Database Response View */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Database Engine Result Set ({currentResult.matched.length} record{currentResult.matched.length === 1 ? '' : 's'})
              </span>
            </div>

            {currentResult.matched.length > 0 ? (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">ID</th>
                      <th className="py-2 px-3">Username</th>
                      <th className="py-2 px-3">Assigned Role</th>
                      <th className="py-2 px-3">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {currentResult.matched.map((user) => (
                      <tr
                        key={user.id}
                        className={user.role === 'SuperAdministrator' || user.role === 'ROOT_PWNED' ? 'bg-rose-950/20' : 'bg-slate-900'}
                      >
                        <td className="py-2 px-3 text-slate-500 font-bold">{user.id}</td>
                        <td className="py-2 px-3 font-semibold text-slate-200">{user.username}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              user.role === 'SuperAdministrator'
                                ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-400">{user.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-3 py-6 text-center text-xs text-slate-500 font-mono">
                Empty set (0 records matched). User credentials rejected.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remediation Code Comparison */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Production Remediation & Defense Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-rose-950/20 border border-rose-900/50 rounded-lg p-4">
            <div className="text-rose-400 font-bold mb-2 flex items-center gap-1.5">
              <span>✕ VULNERABLE: Dynamic Concatenation</span>
            </div>
            <pre className="text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
{`// NEVER DO THIS
const query = \`
  SELECT * FROM users 
  WHERE email = '\${email}' 
  AND password = '\${password}';
\`;
await db.query(query);`}
            </pre>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-lg p-4">
            <div className="text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
              <span>✓ SECURE: Parameterized Query (Prepared Statement)</span>
            </div>
            <pre className="text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
{`// ALWAYS DO THIS
const query = \`
  SELECT id, email, password_hash, role 
  FROM users 
  WHERE email = ?;
\`;
// Input is guaranteed to be treated as pure data
const [user] = await db.query(query, [email]);`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
