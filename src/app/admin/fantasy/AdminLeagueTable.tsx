'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
    Copy,
    ExternalLink,
    Pencil,
    Archive,
    Trash2,
    RefreshCw,
    AlertTriangle
} from 'lucide-react';
import { updateLeague, archiveLeague, deleteLeague, regenerateInviteCode } from './actions';

type League = {
    id: string;
    name: string;
    season_year: number;
    league_code: string;
    max_teams: number;
    created_at: string;
    status: 'active' | 'archived'; // from our new definition
    commissioner_email?: string;
    team_count: number;
    has_draft: boolean;
    has_schedule: boolean;
    commissioner_id: string; // for editing
};

export default function AdminLeagueTable({ leagues }: { leagues: League[] }) {
    const { toast } = useToast();
    const [editingLeague, setEditingLeague] = useState<League | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({ title: "Copied!", description: `League code ${code} copied to clipboard.` });
    };

    const handleArchive = async (id: string) => {
        try {
            await archiveLeague(id);
            toast({ title: "Archived", description: "League has been archived." });
        } catch (e: any) {
            toast({ variant: "destructive", title: "Error", description: e.message });
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await deleteLeague(deletingId);
            toast({ title: "Deleted", description: "League permanently deleted." });
            setIsDeleteOpen(false);
        } catch (e: any) {
            toast({ variant: "destructive", title: "Error", description: e.message });
        }
    };

    const handleRegenerate = async (id: string) => {
        try {
            await regenerateInviteCode(id);
            toast({ title: "Regenerated", description: "New invite code created." });
            // Close edit modal to refresh data or just let revalidate handle it?
            // Revalidate happens on server, but client state might be stale if modal open. 
            // We should ideally close modal or refetch. Next.js revalidatePath should refresh the page prop.
            setIsEditOpen(false);
        } catch (e: any) {
            toast({ variant: "destructive", title: "Error", description: e.message });
        }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLeague) return;

        try {
            const formData = new FormData(e.target as HTMLFormElement);
            await updateLeague(editingLeague.id, {
                name: formData.get('name') as string,
                season_year: parseInt(formData.get('season') as string),
                commissioner_id: formData.get('commish') as string, // Inputting ID for now as requested
                status: formData.get('status') as 'active' | 'archived'
            });
            toast({ title: "Saved", description: "League updated." });
            setIsEditOpen(false);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err.message });
        }
    };

    return (
        <div className="bg-black/40 border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-gray-400 uppercase font-bold text-xs">
                    <tr>
                        <th className="px-6 py-4">League Info</th>
                        <th className="px-6 py-4">Commissioner</th>
                        <th className="px-6 py-4">Stats</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {leagues.map((league) => (
                        <tr key={league.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-bold text-white text-base">{league.name}</div>
                                <div className="text-gray-500 text-xs flex gap-2 mt-1">
                                    <span>{league.season_year}</span>
                                    <span>•</span>
                                    <span className="font-mono text-yellow-500 cursor-pointer hover:underline" onClick={() => copyCode(league.league_code)}>
                                        {league.league_code} <Copy className="w-3 h-3 inline ml-0.5" />
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-white">{league.commissioner_email}</div>
                                <div className="text-xs text-gray-600 font-mono truncate max-w-[100px]">{league.commissioner_id}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-gray-300">
                                    {league.team_count} / {league.max_teams} Teams
                                </div>
                                <div className="flex gap-2 mt-1">
                                    <Badge variant={league.has_draft ? "default" : "secondary"} className="text-[10px] h-4 px-1">
                                        Draft
                                    </Badge>
                                    <Badge variant={league.has_schedule ? "default" : "secondary"} className="text-[10px] h-4 px-1">
                                        Schedule
                                    </Badge>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <Badge variant={league.status === 'active' ? "default" : "destructive"}>
                                    {league.status}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/fantasy/leagues/${league.id}`} target="_blank">
                                            <ExternalLink className="w-4 h-4 text-blue-400" />
                                        </Link>
                                    </Button>

                                    <Button variant="ghost" size="icon" onClick={() => {
                                        setEditingLeague(league);
                                        setIsEditOpen(true);
                                    }}>
                                        <Pencil className="w-4 h-4 text-gray-400" />
                                    </Button>

                                    {league.status === 'active' && (
                                        <Button variant="ghost" size="icon" onClick={() => handleArchive(league.id)}>
                                            <Archive className="w-4 h-4 text-orange-400" />
                                        </Button>
                                    )}

                                    <Button variant="ghost" size="icon" className="hover:bg-red-900/20" onClick={() => {
                                        setDeletingId(league.id);
                                        setIsDeleteOpen(true);
                                    }}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-neutral-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit League</DialogTitle>
                    </DialogHeader>
                    {editingLeague && (
                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>League Name</Label>
                                <Input name="name" defaultValue={editingLeague.name} className="bg-black/50 border-white/10" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Season</Label>
                                    <Input name="season" type="number" defaultValue={editingLeague.season_year} className="bg-black/50 border-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <select name="status" defaultValue={editingLeague.status} className="w-full h-10 rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white">
                                        <option value="active">Active</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Commissioner ID (User UUID)</Label>
                                <Input name="commish" defaultValue={editingLeague.commissioner_id} className="bg-black/50 border-white/10 font-mono" />
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <Label className="mb-2 block text-gray-400">Invite Code</Label>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-black/50 p-2 rounded font-mono border border-white/10 flex items-center justify-between">
                                        {editingLeague.league_code}
                                    </div>
                                    <Button type="button" variant="outline" onClick={() => handleRegenerate(editingLeague.id)}>
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Regen
                                    </Button>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="bg-red-950 border-red-500/20 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-red-500 font-bold">
                            <AlertTriangle className="mr-2" />
                            DANGEROUS ACTION
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-gray-300">
                        Are you sure you want to permanently delete this league?
                        This will remove all teams, rosters, matchups, and history.
                        <strong>This cannot be undone.</strong>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Start Deletion</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
