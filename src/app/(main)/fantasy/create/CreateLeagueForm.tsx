'use client';

import { useState } from 'react';
import { createLeague } from '../actions';
import { ChevronDown, Shield, Users, Calendar, Settings, Lock, Eye } from 'lucide-react';

export default function CreateLeagueForm() {
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [visibility, setVisibility] = useState('private');

    return (
        <form action={createLeague} className="space-y-6">
            {/* 1. BASIC PAGE (UNCHANGED) */}
            <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-300 uppercase mb-2">
                    League Name
                </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    placeholder="e.g. Stallions Superfan League"
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-colors"
                />
            </div>

            <div>
                <label htmlFor="teamName" className="block text-sm font-bold text-gray-300 uppercase mb-2">
                    Your Team Name
                </label>
                <input
                    type="text"
                    name="teamName"
                    id="teamName"
                    required
                    placeholder="e.g. Birmingham Bombers"
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-colors"
                />
            </div>

            <div>
                <label htmlFor="teams" className="block text-sm font-bold text-gray-300 uppercase mb-2">
                    Number of Teams
                </label>
                <select
                    name="teams"
                    id="teams"
                    required
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none transition-colors appearance-none"
                    style={{ backgroundImage: 'none' }} // Removing default arrow to avoid clash if we customized, but standard select is fine
                >
                    <option value="4">4 Teams (Small)</option>
                    <option value="6">6 Teams</option>
                    <option value="8">8 Teams (Standard)</option>
                    <option value="10">10 Teams</option>
                    <option value="12">12 Teams (Large)</option>
                </select>
            </div>

            <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="text-blue-400 font-bold text-sm uppercase mb-1">WHAT HAPPENS NEXT?</h3>
                <ul className="text-blue-200/70 text-sm list-disc list-inside space-y-1">
                    <li>Your league and first team will be created.</li>
                    <li>Share your invite code so others can join and claim teams.</li>
                    <li>When you&apos;re ready, start the season from the Commissioner Tools.</li>
                </ul>
            </div>

            {/* 2. ADVANCED OPTIONS COLLAPSIBLE PANEL */}
            <div className="border-t border-white/10 pt-4">
                <button
                    type="button"
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                    className="w-full flex items-center justify-between text-left group"
                >
                    <div>
                        <h3 className="text-lg font-bold text-gray-300 group-hover:text-white transition-colors flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            ADVANCED OPTIONS
                        </h3>
                        <p className="text-sm text-gray-500">Optional settings for more control.</p>
                    </div>
                    <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''
                            }`}
                    />
                </button>

                <div
                    className={`grid transition-all duration-300 ease-in-out overflow-hidden ${isAdvancedOpen ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0'
                        }`}
                >
                    <div className="min-h-0 space-y-6 bg-white/5 rounded-xl p-6 border border-white/5">
                        {/* 3.1 Visibility */}
                        <div>
                            <label className="block text-sm font-bold text-gray-300 uppercase mb-3">League Visibility</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label
                                    className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${visibility === 'private'
                                        ? 'bg-red-600/20 border-red-600 text-white'
                                        : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="private"
                                        checked={visibility === 'private'}
                                        onChange={() => setVisibility('private')}
                                        className="hidden"
                                    />
                                    <Lock className="w-6 h-6" />
                                    <span className="font-bold">Private</span>
                                    <span className="text-xs text-center opacity-70">Invite-only via Code</span>
                                </label>

                                <label
                                    className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${visibility === 'public'
                                        ? 'bg-red-600/20 border-red-600 text-white'
                                        : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="public"
                                        checked={visibility === 'public'}
                                        onChange={() => setVisibility('public')}
                                        className="hidden"
                                    />
                                    <Eye className="w-6 h-6" />
                                    <span className="font-bold">Public</span>
                                    <span className="text-xs text-center opacity-70">Visible in Directory</span>
                                </label>
                            </div>
                        </div>

                        {/* Custom Invite Code (Private Only) */}
                        {visibility === 'private' && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label htmlFor="customCode" className="block text-sm font-bold text-gray-300 uppercase mb-2">
                                    Custom Invite Code <span className="text-gray-500 font-normal normal-case">(Optional)</span>
                                </label>
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        name="customCode"
                                        id="customCode"
                                        maxLength={6}
                                        placeholder="e.g. MYCODE (Leave blank for auto-generated)"
                                        className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-600 font-mono tracking-wider uppercase focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-colors"
                                        onChange={(e) => e.target.value = e.target.value.toUpperCase()}
                                    />
                                    <p className="text-xs text-gray-500">
                                        Must be exactly 6 alphanumeric characters.
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-lg uppercase tracking-wide transition-colors transform active:scale-95"
            >
                Create League
            </button>
        </form>
    );
}
