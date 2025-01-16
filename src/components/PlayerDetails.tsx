import React from 'react';
import { X, User, Medal, Shirt, Phone, Ruler } from 'lucide-react';
import type { Player } from '../types';

interface PlayerDetailsProps {
  player: Player;
  onClose: () => void;
}

export default function PlayerDetails({ player, onClose }: PlayerDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-full max-w-2xl overflow-hidden border border-gray-700 shadow-2xl">
        <div className="relative p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Player Photo */}
            <div className="flex-shrink-0">
              {player.photoUrl ? (
                <img
                  src={player.photoUrl}
                  alt={player.name}
                  className="w-48 h-48 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-48 h-48 rounded-2xl bg-gray-700 flex items-center justify-center">
                  <span className="text-6xl text-gray-400">
                    {player.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="flex-grow">
              <h2 className="text-3xl font-bold text-white mb-6">{player.name}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-700/50 rounded-lg">
                      <Medal className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Role</p>
                      <p className="text-white font-medium">{player.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-700/50 rounded-lg">
                      <Shirt className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Jersey Number</p>
                      <p className="text-white font-medium">#{player.jerseyNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-700/50 rounded-lg">
                      <Phone className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Mobile Number</p>
                      <p className="text-white font-medium">{player.mobileNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-700/50 rounded-lg">
                      <Ruler className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">T-shirt Size</p>
                      <p className="text-white font-medium">{player.tshirtSize}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}