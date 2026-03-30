import { useEffect } from 'react';

interface MetaOptions {
    title: string;
    description?: string;
}

export function useMeta({ title, description }: MetaOptions) {
    useEffect(() => {
        const prevTitle = document.title;
        document.title = title;

        let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        const prevDesc = meta?.content;

        if (description) {
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = 'description';
                document.head.appendChild(meta);
            }
            meta.content = description;
        }

        return () => {
            document.title = prevTitle;
            if (meta && prevDesc !== undefined) meta.content = prevDesc;
        };
    }, [title, description]);
}
