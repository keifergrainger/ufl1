import { Construction } from 'lucide-react'

export default function PlaceholderPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border border-white/5 rounded-xl bg-neutral-900/50">
            <Construction className="w-16 h-16 text-neutral-600 mb-6" />
            <h2 className="text-2xl font-black italic uppercase text-white mb-2">Under Construction</h2>
            <p className="text-neutral-400 max-w-md">
                This admin module is coming soon in a future update.
            </p>
        </div>
    )
}
