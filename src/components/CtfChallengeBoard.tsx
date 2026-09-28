import React, { useState } from 'react';
import { Flag, Trophy, Award, CheckCircle, HelpCircle, AlertCircle, ChevronDown, ChevronUp, Sparkles, Terminal } from 'lucide-react';
import { CTF_CHALLENGES, CTFChallenge } from '../data/ethicalHackingData';

export const CtfChallengeBoard: React.FC = () => {
  const [submittedFlags, setSubmittedFlags] = useState<Record<string, string>>({});
  const [solvedChallenges, setSolvedChallenges] = useState<string[]>([]);
  const [expandedHints, setExpandedHints] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<Record<string, { status: 'correct' | 'incorrect'; msg: string }>>({});

  const totalPoints = CTF_CHALLENGES.reduce((acc, c) => acc + c.points, 0);
  const currentScore = solvedChallenges.reduce((acc, id) => {
    const ch = CTF_CHALLENGES.find((c) => c.id === id);
    return acc + (ch ? ch.points : 0);
  }, 0);

  const handleFlagSubmit = (challengeId: string) => {
    const challenge = CTF_CHALLENGES.find((c) => c.id === challengeId);
    if (!challenge) return;

    const userAttempt = (submittedFlags[challengeId] || '').trim();
    if (userAttempt === challenge.flag) {
      if (!solvedChallenges.includes(challengeId)) {
        setSolvedChallenges((prev) => [...prev, challengeId]);
      }
      setFeedback((prev) => ({
        ...prev,
        [challengeId]: { status: 'correct', msg: `Correct! +${challenge.points} points awarded.` }
      }));
    } else {
      setFeedback((prev) => ({
        ...prev,
        [challengeId]: { status: 'incorrect', msg: 'Incorrect flag. Check hints or test in the relevant lab.' }
      }));
    }
  };

  const toggleHint = (id: string) => {
    setExpandedHints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Scoreboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                Gamified Security Training
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Flag className="w-5 h-5 text-emerald-400" />
                Capture The Flag (CTF) Challenge Arena
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Apply ethical hacking techniques, solve simulated vulnerability puzzles, and submit verified flags to earn score points.
            </p>
          </div>

          {/* Score Counter */}
          <div className="flex items-center gap-4 bg-slate-950 px-5 py-3 rounded-xl border border-slate-800 self-start md:self-auto">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Total Score</span>
                <span className="text-xl font-extrabold text-white font-mono">
                  {currentScore} <span className="text-xs text-slate-500 font-normal">/ {totalPoints} pts</span>
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Solved</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                {solvedChallenges.length} / {CTF_CHALLENGES.length}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>Overall CTF Completion Progress</span>
            <span className="text-emerald-400 font-bold">
              {Math.round((solvedChallenges.length / CTF_CHALLENGES.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${(solvedChallenges.length / CTF_CHALLENGES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Challenge Cards List */}
      <div className="space-y-4">
        {CTF_CHALLENGES.map((challenge, index) => {
          const isSolved = solvedChallenges.includes(challenge.id);
          const fb = feedback[challenge.id];

          return (
            <div
              key={challenge.id}
              className={`bg-slate-900 border rounded-xl p-5 transition-all ${
                isSolved
                  ? 'border-emerald-700/60 bg-emerald-950/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      #{index + 1}
                    </span>
                    <h3 className="text-base font-bold text-white">{challenge.title}</h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        challenge.difficulty === 'Beginner'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : challenge.difficulty === 'Intermediate'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {challenge.difficulty}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {challenge.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {challenge.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <span className="text-sm font-bold text-amber-400 font-mono bg-amber-950/40 border border-amber-800 px-3 py-1 rounded-lg">
                    +{challenge.points} pts
                  </span>
                  {isSolved && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5" />
                      COMPLETED
                    </span>
                  )}
                </div>
              </div>

              {/* Hints Accordion */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => toggleHint(challenge.id)}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 font-semibold"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {expandedHints[challenge.id] ? 'Hide Mission Intel / Hint' : 'View Mission Intel / Hint'}
                  {expandedHints[challenge.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {expandedHints[challenge.id] && (
                  <div className="mt-2 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono">
                    <span className="text-amber-400 font-bold block mb-1">Intel Clue:</span>
                    {challenge.hint}
                  </div>
                )}
              </div>

              {/* Flag Input Form */}
              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  disabled={isSolved}
                  value={submittedFlags[challenge.id] || ''}
                  onChange={(e) =>
                    setSubmittedFlags((prev) => ({ ...prev, [challenge.id]: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === 'Enter' && handleFlagSubmit(challenge.id)}
                  placeholder="FLAG{...}"
                  className="flex-1 bg-slate-950 border border-slate-700 disabled:opacity-60 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                />
                <button
                  onClick={() => handleFlagSubmit(challenge.id)}
                  disabled={isSolved || !(submittedFlags[challenge.id] || '').trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Submit Flag
                </button>
              </div>

              {/* Feedback Alert */}
              {fb && (
                <div
                  className={`mt-2 p-2 rounded text-xs font-mono flex items-center gap-2 ${
                    fb.status === 'correct'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                  }`}
                >
                  {fb.status === 'correct' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{fb.msg}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
