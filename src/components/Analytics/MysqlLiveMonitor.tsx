import React, { useState, useEffect } from 'react';
import { Database, UserCheck, ShieldCheck, RefreshCw, Activity, Server, Key, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MySQLUser {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

interface MemberStats {
  total_registered_users: number;
  total_logins_recorded: number;
}

export const MysqlLiveMonitor: React.FC = () => {
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [members, setMembers] = useState<MySQLUser[]>([]);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Live Test Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const FASTAPI_URL = 'http://localhost:8000';

  const fetchLiveDatabaseData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch Stats
      const statsRes = await fetch(`${FASTAPI_URL}/api/members/stats`);
      if (!statsRes.ok) throw new Error('FastAPI server on port 8000 not reachable');
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Fetch All Members
      const membersRes = await fetch(`${FASTAPI_URL}/api/members/all`);
      const membersData = await membersRes.json();
      setMembers(membersData);

      setIsConnected(true);
    } catch (err: any) {
      setIsConnected(false);
      setErrorMsg('Could not connect to Python FastAPI + MySQL backend at http://localhost:8000. Ensure uvicorn main:app is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveDatabaseData();
    // Auto refresh every 5 seconds
    const interval = setInterval(fetchLiveDatabaseData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTestSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionSuccess('');
    setActionError('');

    try {
      const res = await fetch(`${FASTAPI_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Signup failed');
      }

      setActionSuccess(`✅ User created in MySQL! ID: ${data.id}, Username: ${data.username}`);
      setUsername('');
      setEmail('');
      setPassword('');
      fetchLiveDatabaseData();
    } catch (err: any) {
      setActionError(err.message || 'Error creating user in MySQL');
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Connection Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <Database className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">MySQL Real-Time Database Monitor</h2>
                {isConnected === true && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Live Connected
                  </span>
                )}
                {isConnected === false && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    Disconnected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Target: <span className="font-mono text-slate-200">MySQL recruitment_db @ localhost:3306</span> via Python FastAPI
              </p>
            </div>
          </div>

          <button
            onClick={fetchLiveDatabaseData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh MySQL
          </button>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Total Registered Users</span>
              <UserCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {stats ? stats.total_registered_users : '0'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Starts at User ID 101</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Total Logins Recorded</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {stats ? stats.total_logins_recorded : '0'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Audit Logged in MySQL</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>JWT Authentication</span>
              <Key className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xs font-bold text-purple-300 font-mono">
              HS256 Standard
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Bcrypt Hash Verification</div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">MySQL Connection Warning</p>
            <p className="mt-1 text-slate-300">{errorMsg}</p>
            <p className="mt-2 text-slate-400 font-mono">Run: cd backend && uvicorn main:app --reload --port 8000</p>
          </div>
        </div>
      )}

      {/* Grid: Live Test Signup Form + MySQL Live Users Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Test Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-blue-600" />
            Test Live MySQL Signup
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Insert a new record directly into your MySQL <code className="text-blue-500 font-mono">users</code> table.
          </p>

          <form onSubmit={handleTestSignup} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Username</label>
              <input
                type="text"
                required
                placeholder="e.g. john_doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Strong Password</label>
              <input
                type="password"
                required
                placeholder="e.g. Pass123!"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Min 8 chars, 1 uppercase, 1 number, 1 special char</p>
            </div>

            {actionSuccess && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {actionError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-blue-500/20"
            >
              Insert into MySQL Database
            </button>
          </form>
        </div>

        {/* Live Users Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Live MySQL <code className="text-emerald-500 font-mono">users</code> Table Data
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time records stored in MySQL with auto-increment ID starting at 101
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">
              {members.length} Users Stored
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="px-3 py-2.5 rounded-l-lg">User ID</th>
                  <th className="px-3 py-2.5">Username</th>
                  <th className="px-3 py-2.5">Email Address</th>
                  <th className="px-3 py-2.5">Role</th>
                  <th className="px-3 py-2.5 rounded-r-lg">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                      {isConnected === false
                        ? 'Backend disconnected. Start uvicorn server to view MySQL records.'
                        : 'No users in MySQL database yet. Register a new user using the form on the left!'}
                    </td>
                  </tr>
                ) : (
                  members.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="px-3 py-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                        #{u.id}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-slate-100">
                        {u.username}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                        {u.email}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-400 font-mono text-[11px]">
                        {new Date(u.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
