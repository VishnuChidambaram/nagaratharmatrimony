const getApiUrl = () => {
    // Check environment variable first (for deployment)
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // If accessed via IP, use that same IP for the API
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return `http://${hostname}:5000`;
        }
    }
    return 'http://localhost:5000';
};

export const API_URL = getApiUrl();
console.log("API_URL initialized as:", API_URL);
