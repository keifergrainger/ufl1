'use client'

import { analytics } from "@/lib/analytics"
import { useEffect } from "react"

export default function LogPlayerView({ playerId }: { playerId: string }) {
    useEffect(() => {
        analytics.logPlayerView(playerId)
    }, [playerId])

    return null
}
