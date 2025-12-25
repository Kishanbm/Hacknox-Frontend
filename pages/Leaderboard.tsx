import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { Trophy, Crown, Medal, ChevronDown, Search, Users, Award, Star } from 'lucide-react';
import { publicService } from '../services/public.service';
import { teamService } from '../services/team.service';

interface LeaderboardEntry {
  rank: number;
  team_id: string;
  team_name: string;
  project_title?: string;
  final_score: number;
  hackathon_id?: string;
  hackathon_name?: string;
}

const Leaderboard: React.FC = () => {
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('all');
  const [myHackathons, setMyHackathons] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch hackathons user has participated in
  useEffect(() => {
    const fetchMyHackathons = async () => {
      try {
        const teamsResponse = await teamService.getMyTeams();
        const teams = Array.isArray(teamsResponse) ? teamsResponse : (teamsResponse as any)?.teams || [];
        
        // Extract unique hackathons from teams
        const hackathonMap = new Map();
        teams.forEach((t: any) => {
          const hackathonId = t.hackathon_id || t.hackathonId;
          if (hackathonId && !hackathonMap.has(hackathonId)) {
            hackathonMap.set(hackathonId, {
              id: hackathonId,
              name: t.hackathon_name || t.hackathon_title || t.hackathon?.name || 'Hackathon',
              phase: t.hackathon_phase || t.hackathon?.phase,
              status: t.hackathon_status || t.hackathon?.status,
              leaderboard_published: t.leaderboard_published
            });
          }
        });
        setMyHackathons(Array.from(hackathonMap.values()));
      } catch (err) {
        console.error('Failed to fetch hackathons:', err);
      }
    };
    fetchMyHackathons();
  }, []);

  // Fetch leaderboard based on selection
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (selectedHackathonId === 'all') {
          // Fetch top 3 winners from all hackathons (attempt each, skip if not published)
          const allWinners: LeaderboardEntry[] = [];
          for (const hackathon of myHackathons) {
            try {
              const data = await publicService.getLeaderboard(hackathon.id);
              // Handle different response shapes
              let entries: any[] = [];
              if (Array.isArray(data)) {
                entries = data;
              } else if (data && typeof data === 'object') {
                entries = (data as any).leaderboard || (data as any).data || [];
              }
              
              // Get top 3 from each hackathon
              entries.slice(0, 3).forEach((entry: any, idx: number) => {
                allWinners.push({
                  rank: entry.rank || idx + 1,
                  team_id: entry.team_id || entry.teamId || entry.id,
                  team_name: entry.team_name || entry.teamName || entry.team?.name || 'Unknown Team',
                  project_title: entry.project_title || entry.projectTitle || entry.submission?.title || entry.project || '',
                  final_score: entry.final_score ?? entry.finalScore ?? entry.score ?? entry.total_score ?? 0,
                  hackathon_id: hackathon.id,
                  hackathon_name: hackathon.name
                });
              });
            } catch (e) {
              // Individual hackathon leaderboard might not be published - skip silently
              console.debug(`Leaderboard not available for ${hackathon.name}`);
            }
          }
          setLeaderboard(allWinners);
          if (allWinners.length === 0 && myHackathons.length > 0) {
            setError('No published results yet. Results will appear once leaderboards are published.');
          }
        } else {
          // Fetch full leaderboard for selected hackathon
          const data = await publicService.getLeaderboard(selectedHackathonId);
          // Handle different response shapes
          let entries: any[] = [];
          if (Array.isArray(data)) {
            entries = data;
          } else if (data && typeof data === 'object') {
            entries = (data as any).leaderboard || (data as any).data || [];
          }
          
          const selectedHackathon = myHackathons.find(h => h.id === selectedHackathonId);
          setLeaderboard(entries.map((entry: any, idx: number) => ({
            rank: entry.rank || idx + 1,
            team_id: entry.team_id || entry.teamId || entry.id,
            team_name: entry.team_name || entry.teamName || entry.team?.name || 'Unknown Team',
            project_title: entry.project_title || entry.projectTitle || entry.submission?.title || entry.project || '',
            final_score: entry.final_score ?? entry.finalScore ?? entry.score ?? entry.total_score ?? 0,
            hackathon_id: selectedHackathonId,
            hackathon_name: selectedHackathon?.name || 'Hackathon'
          })));
        }
      } catch (err: any) {
        console.error('Failed to fetch leaderboard:', err);
        setError('Results not yet published for this hackathon');
        setLeaderboard([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have hackathons loaded (or explicitly selecting 'all')
    if (myHackathons.length > 0) {
      fetchLeaderboard();
    } else {
      setIsLoading(false);
    }
  }, [selectedHackathonId, myHackathons]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500 fill-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Medal className="text-amber-600" size={24} />;
      default:
        return <span className="text-gray-400 font-bold">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-20 md:pb-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading text-gray-900 flex items-center gap-3">
              <Trophy className="text-yellow-500" size={32} />
              Leaderboard
            </h1>
            <p className="text-gray-500 text-sm md:text-base">View rankings and results from your hackathons</p>
          </div>
          
          {/* Hackathon Filter */}
          <div className="relative w-full md:w-64">
            <select
              value={selectedHackathonId}
              onChange={(e) => setSelectedHackathonId(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 font-bold text-gray-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="all">All Hackathons (Top 3)</option>
              {myHackathons.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-pulse px-6 py-3 bg-gray-100 rounded-xl">Loading results...</div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-sm">
              <Trophy size={32} />
            </div>
            <h3 className="text-gray-900 font-bold mb-1">No Results Available</h3>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-sm">
              <Trophy size={32} />
            </div>
            <h3 className="text-gray-900 font-bold mb-1">No Results Yet</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Results will appear here once hackathons you've participated in are completed and leaderboards are published.
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium for specific hackathon */}
            {selectedHackathonId !== 'all' && leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* 2nd Place */}
                <div className="flex flex-col items-center justify-end">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-6 text-center w-full shadow-lg relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">2</div>
                    <Medal className="text-gray-400 mx-auto mb-3 mt-4" size={40} />
                    <h3 className="font-bold text-gray-900 text-lg truncate">{leaderboard[1]?.team_name}</h3>
                    <p className="text-sm text-gray-500 truncate">{leaderboard[1]?.project_title || 'Project'}</p>
                    <div className="text-2xl font-heading text-gray-700 mt-2">{leaderboard[1]?.final_score?.toFixed(1) || '-'}</div>
                  </div>
                </div>
                
                {/* 1st Place */}
                <div className="flex flex-col items-center justify-end -mt-6">
                  <div className="bg-gradient-to-br from-yellow-100 to-amber-200 rounded-3xl p-6 text-center w-full shadow-xl relative border-2 border-yellow-300">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      <Crown size={24} />
                    </div>
                    <Trophy className="text-yellow-500 mx-auto mb-3 mt-6" size={48} />
                    <h3 className="font-bold text-gray-900 text-xl truncate">{leaderboard[0]?.team_name}</h3>
                    <p className="text-sm text-gray-600 truncate">{leaderboard[0]?.project_title || 'Project'}</p>
                    <div className="text-3xl font-heading text-yellow-600 mt-2">{leaderboard[0]?.final_score?.toFixed(1) || '-'}</div>
                    <div className="text-xs text-yellow-700 font-bold uppercase mt-1">Winner</div>
                  </div>
                </div>
                
                {/* 3rd Place */}
                <div className="flex flex-col items-center justify-end">
                  <div className="bg-gradient-to-br from-amber-100 to-orange-200 rounded-3xl p-6 text-center w-full shadow-lg relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">3</div>
                    <Medal className="text-amber-600 mx-auto mb-3 mt-4" size={40} />
                    <h3 className="font-bold text-gray-900 text-lg truncate">{leaderboard[2]?.team_name}</h3>
                    <p className="text-sm text-gray-500 truncate">{leaderboard[2]?.project_title || 'Project'}</p>
                    <div className="text-2xl font-heading text-amber-700 mt-2">{leaderboard[2]?.final_score?.toFixed(1) || '-'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Full Leaderboard Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-heading text-lg text-gray-900 flex items-center gap-2">
                  <Award size={20} className="text-primary" />
                  {selectedHackathonId === 'all' ? 'Winners Across All Hackathons' : 'Full Rankings'}
                </h3>
              </div>
              
              <div className="divide-y divide-gray-50">
                {leaderboard.map((entry, idx) => (
                  <div
                    key={`${entry.hackathon_id}-${entry.team_id}-${idx}`}
                    className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${getRankBg(entry.rank)}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900">{entry.team_name}</h4>
                          {entry.rank <= 3 && (
                            <Star className="text-yellow-400 fill-yellow-400" size={14} />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {entry.project_title && <span>{entry.project_title}</span>}
                          {selectedHackathonId === 'all' && entry.hackathon_name && (
                            <span className="text-xs text-primary font-medium ml-2">• {entry.hackathon_name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-heading text-primary">{entry.final_score?.toFixed(1) || '-'}</div>
                      <div className="text-xs text-gray-400 font-medium">Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
              <p className="text-sm text-blue-700">
                <span className="font-bold">Note:</span> Only results from completed hackathons with published leaderboards are shown here.
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;
