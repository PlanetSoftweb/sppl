import React, { useState } from 'react';
import { UserPlus, Link as LinkIcon, X, Edit, Trash2 } from 'lucide-react';
import type { SportTeam, Player } from '../types';
import AddPlayer from './AddPlayer';
import EditPlayer from './EditPlayer';
import PlayerDetails from './PlayerDetails';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface TeamViewProps {
  team: SportTeam;
  onClose: () => void;
  onTeamUpdated: (team: SportTeam) => void;
}

export default function TeamView({ team, onClose, onTeamUpdated }: TeamViewProps) {
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [error, setError] = useState('');

  const handlePlayerAdded = (newPlayer: Player) => {
    const updatedTeam = {
      ...team,
      players: [...team.players, newPlayer]
    };
    onTeamUpdated(updatedTeam);
  };

  const handlePlayerUpdated = (oldPlayer: Player, updatedPlayer: Player) => {
    const updatedTeam = {
      ...team,
      players: team.players.map(p => p.id === oldPlayer.id ? updatedPlayer : p)
    };
    onTeamUpdated(updatedTeam);
  };

  const handleDeletePlayer = async (player: Player) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to delete a player');
      }

      const teamRef = doc(db, 'teams', team.id);
      await updateDoc(teamRef, {
        players: arrayRemove(player)
      });

      const updatedTeam = {
        ...team,
        players: team.players.filter(p => p.id !== player.id)
      };
      onTeamUpdated(updatedTeam);
    } catch (err) {
      console.error('Error deleting player:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete player');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {team.sport.charAt(0).toUpperCase() + team.sport.slice(1)} Team
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-300">
              Players: {team.players.length} / {team.maxPlayers}
            </div>
            <div className="flex space-x-4">
              {team.registrationLink && (
                <button className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                  <LinkIcon className="h-5 w-5" />
                  <span>Copy Registration Link</span>
                </button>
              )}
              <button
                onClick={() => setShowAddPlayer(true)}
                disabled={team.players.length >= team.maxPlayers}
                className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="h-5 w-5" />
                <span>Add Player</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.players.map((player) => (
            <div 
              key={player.id} 
              className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
              onClick={() => setSelectedPlayer(player)}
            >
              <div className="flex items-center justify-between mb-4">
                {player.photoUrl ? (
                  <img
                    src={player.photoUrl}
                    alt={player.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-2xl text-gray-400">
                      {player.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPlayer(player);
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlayer(player);
                    }}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">{player.name}</h3>
                <p className="text-gray-400">{player.role}</p>
                <p className="text-gray-400">#{player.jerseyNumber}</p>
              </div>
            </div>
          ))}
        </div>

        {showAddPlayer && (
          <AddPlayer
            team={team}
            onClose={() => setShowAddPlayer(false)}
            onPlayerAdded={handlePlayerAdded}
          />
        )}

        {editingPlayer && (
          <EditPlayer
            team={team}
            player={editingPlayer}
            onClose={() => setEditingPlayer(null)}
            onPlayerUpdated={handlePlayerUpdated}
          />
        )}

        {selectedPlayer && (
          <PlayerDetails
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
          />
        )}
      </div>
    </div>
  );
}