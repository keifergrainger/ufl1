'use client'

import { ExternalLink } from "lucide-react"

export default function ViewLiveSiteButton() {
    const handleNavigation = () => {
        // Logic: Remove "admin." from the hostname
        // admin.bhamstallions.com -> bhamstallions.com
        // admin.localhost -> localhost

        const currentHost = window.location.hostname
        const newHost = currentHost.replace('admin.', '')
        const protocol = window.location.protocol
        const port = window.location.port ? `:${window.location.port}` : ''

        window.location.href = `${protocol}//${newHost}${port}/`
    }

    return (
        <button
            onClick={handleNavigation}
            className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-white transition-colors"
        >
            View Live Site <ExternalLink className="w-4 h-4" />
        </button>
    )
}
