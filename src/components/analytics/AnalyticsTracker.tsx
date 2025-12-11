'use client'

import { analytics } from "@/lib/analytics"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"

export default function AnalyticsTracker() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const lastTracked = useRef<string>('')

    useEffect(() => {
        // Create unique key for this page view
        const search = searchParams.toString()
        const pageKey = `${pathname}${search ? `?${search}` : ''}`

        // Prevent duplicate tracking of the same page in quick succession
        if (lastTracked.current === pageKey) {
            return
        }

        lastTracked.current = pageKey

        // Log the page view
        analytics.logPageView(pathname, { search })
    }, [pathname, searchParams.toString()]) // Use .toString() to get stable value

    return null
}
