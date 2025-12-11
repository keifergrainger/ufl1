'use client';

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ClientCsvDownload({ emails }: { emails: any[] }) {
    const handleDownload = () => {
        const headers = ['ID', 'Email', 'Source', 'Created At'];
        const csvContent = [
            headers.join(','),
            ...emails.map(e => [e.id, e.email, e.source || 'web', e.created_at].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `stallions_emails_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Button
            className="bg-white text-black hover:bg-neutral-200 font-bold uppercase transition-colors"
            onClick={handleDownload}
            disabled={emails.length === 0}
        >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
        </Button>
    )
}
