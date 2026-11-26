"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function AutoRefresh({ sekunder = 60 }) {
    const router = useRouter();

    useEffect(() => {
        const id = setInterval(() => {
            router.refresh();
        }, sekunder * 1000);

        return () => clearInterval(id);
    }, [router, sekunder]);

    return null;
}

export default AutoRefresh;
