'use client'

import { analytics } from "@/lib/analytics"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function AnalyticsTracker() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        // Log page view on mount and when pathname/searchParams change
        analytics.logPageView(pathname, { search: searchParams.toString() })
    }, [pathname, searchParams])

    return null
}
