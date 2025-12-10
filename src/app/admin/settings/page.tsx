import { createClient } from '@/lib/supabase-server'
import SettingsList from './SettingsList'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: settings } = await supabase
        .from('site_settings')
        .select('*')
        .order('key')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Global Settings</h2>
                    <p className="text-neutral-400">Manage site-wide text and configurations.</p>
                </div>
            </div>

            <div className="bg-neutral-900 border border-white/10 rounded-xl overflow-hidden">
                <SettingsList settings={settings || []} />
            </div>
        </div>
    )
}
