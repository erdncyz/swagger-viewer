import { createContext, useContext, useState, useCallback } from 'react';
import { parseEndpoints, convertSwagger2ToOpenApi3 } from '../utils/swagger';

const SwaggerContext = createContext(null);

const DEFAULT_URL = '';
const CORS_PROXIES = [
    (url) => `/api/proxy?url=${encodeURIComponent(url)}`,
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];


export function SwaggerProvider({ children }) {
    const [spec, setSpec] = useState(null);
    const [endpoints, setEndpoints] = useState([]);
    const [tags, setTags] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [url, setUrl] = useState(DEFAULT_URL);
    const [apiInfo, setApiInfo] = useState(null);
    const [authToken, setAuthToken] = useState('');

    const fetchSpec = useCallback(async (targetUrl) => {
        const fetchUrl = targetUrl || url;
        setLoading(true);
        setError(null);
        setSpec(null);
        setEndpoints([]);
        setTags({});
        setApiInfo(null);

        // Build list of URLs to try: direct first, then CORS proxies
        const urls = [
            fetchUrl,
            ...CORS_PROXIES.map((proxy) => proxy(fetchUrl)),
        ];

        for (const tryUrl of urls) {
            try {
                const response = await fetch(tryUrl);
                if (!response.ok) continue;

                let data = await response.json();

                if (data.openapi || data.swagger) {
                    // Convert Swagger 2.0 to OpenAPI 3.0 format
                    if (data.swagger) {
                        data = convertSwagger2ToOpenApi3(data, fetchUrl);
                    }

                    // Ensure servers are populated
                    if (!data.servers || data.servers.length === 0) {
                        try {
                            const u = new URL(fetchUrl);
                            data.servers = [{ url: u.origin }];
                        } catch (e) {
                            // ignore
                        }
                    }

                    setSpec(data);
                    const parsed = parseEndpoints(data);
                    setEndpoints(parsed.endpoints);
                    setTags(parsed.tags);
                    setApiInfo(data.info || null);
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.warn(`Failed to load from ${tryUrl}:`, err);
                continue;
            }
        }

        console.error('All attempts failed to load Swagger JSON.');
        setError('Swagger JSON yüklenemedi. Lütfen URL\'yi kontrol edin veya CORS ayarlarını doğrulayın.');
        setLoading(false);
    }, [url]);

    const value = {
        spec,
        endpoints,
        tags,
        loading,
        error,
        url,
        setUrl,
        apiInfo,
        fetchSpec,
        authToken,
        setAuthToken,
    };

    return (
        <SwaggerContext.Provider value={value}>
            {children}
        </SwaggerContext.Provider>
    );
}

export function useSwagger() {
    const context = useContext(SwaggerContext);
    if (!context) {
        throw new Error('useSwagger must be used within a SwaggerProvider');
    }
    return context;
}
