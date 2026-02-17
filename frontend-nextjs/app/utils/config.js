const getApiUrl = () => {
    // Check environment variable first (for deployment)
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    if (typeof window !== 'undefined') {
        const { hostname, protocol } = window.location;
        // If accessed via a non-local hostname, use the same protocol and guess port if needed
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            // If it's HTTPS (production), don't append :5000 as typical proxies handle it
            const port = protocol === 'https:' ? '' : ':5000';
            return `${protocol}//${hostname}${port}`;
        }
    }
    return 'http://localhost:5000';
};

export const API_URL = getApiUrl();
console.log("API_URL initialized as:", API_URL);
