import { useState } from 'react';
import JsonViewer from './JsonViewer';

import { useLanguage } from '../context/LanguageContext';

export default function CurlRunnerModal({ onClose }) {
    const { t } = useLanguage();
    const [curlCommand, setCurlCommand] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [responseTime, setResponseTime] = useState(null);
    const [parseError, setParseError] = useState(null);

    const parseCurl = (cmd) => {
        try {
            // Basic cleanup: remove newlines and line continuations
            let cleanCmd = cmd.replace(/\\\n/g, ' ').replace(/\\\r\n/g, ' ').replace(/\n/g, ' ').trim();

            // Regex for URL (can be in quotes or not)
            const urlMatch = cleanCmd.match(/['"](https?:\/\/[^'"]+)['"]/) || cleanCmd.match(/(https?:\/\/[^\s]+)/);
            if (!urlMatch) throw new Error("URL bulunamadı.");
            const url = urlMatch[1];

            // Method
            let method = 'GET';
            const methodMatch = cleanCmd.match(/-X\s+['"]?([A-Z]+)['"]?/);
            if (methodMatch) method = methodMatch[1];
            else if (cleanCmd.includes('-d ') || cleanCmd.includes('--data')) method = 'POST';

            // Headers
            const headers = {};
            const headerRegex = /-H\s+['"]([^'"]+)['"]/g;
            let headerMatch;
            while ((headerMatch = headerRegex.exec(cleanCmd)) !== null) {
                const [key, ...valueParts] = headerMatch[1].split(':');
                if (key && valueParts.length > 0) {
                    headers[key.trim()] = valueParts.join(':').trim();
                }
            }

            // Body
            let body = null;
            const dataRegex = /(-d|--data|--data-raw)\s+'([^']+)'/; // Single quoted body
            // This is a simplified parser. Complex nested quotes might fail.
            const bodyMatch = cleanCmd.match(dataRegex);
            if (bodyMatch) {
                body = bodyMatch[2];
            }

            return { url, method, headers, body };

        } catch (e) {
            throw new Error(`cURL ayrıştırılamadı: ${e.message}`);
        }
    };

    const handleRun = async () => {
        setLoading(true);
        setResponse(null);
        setParseError(null);
        setResponseTime(null);

        try {
            if (!curlCommand.trim()) throw new Error("Lütfen bir cURL komutu girin.");

            const { url, method, headers, body } = parseCurl(curlCommand);

            // Proxy handling for CORS (same logic as generic proxy)
            // If the URL is not localhost, use our local proxy to avoid CORS
            let fetchUrl = url;
            const isLocal = url.includes('localhost') || url.includes('127.0.0.1');

            if (!isLocal) {
                // Use the same proxy endpoint defined in vite.config.js
                fetchUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
                // Remove host header if present as it might confuse the proxy
                delete headers['host'];
                delete headers['Host'];
            }

            const options = {
                method,
                headers,
            };

            if (body) {
                options.body = body;
            }

            const startTime = performance.now();
            const res = await fetch(fetchUrl, options);
            const elapsed = Math.round(performance.now() - startTime);
            setResponseTime(elapsed);

            let data;
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('json')) {
                data = await res.json();
            } else {
                data = await res.text();
            }

            setResponse({
                status: res.status,
                statusText: res.statusText,
                data,
            });

        } catch (err) {
            setParseError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-overlay" onClick={onClose}>
            <div className="auth-modal curl-runner-modal" onClick={(e) => e.stopPropagation()}>
                <div className="auth-modal-header">
                    <h2>{t('runnerTitle')}</h2>
                    <button className="auth-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="auth-modal-body">
                    <div className="auth-input-group">
                        <label>{t('runnerLabel')}</label>
                        <textarea
                            className="curl-textarea"
                            value={curlCommand}
                            onChange={(e) => setCurlCommand(e.target.value)}
                            placeholder={t('runnerPlaceholder')}
                        />
                    </div>

                    {parseError && (
                        <div className="error-message" style={{ color: 'var(--method-delete)', marginBottom: 12 }}>
                            ❌ {parseError}
                        </div>
                    )}

                    <div className="auth-actions">
                        <button
                            className="auth-authorize-btn"
                            onClick={handleRun}
                            disabled={loading}
                            style={{ flex: 1 }}
                        >
                            {loading ? t('runningBtn') : t('runBtn')}
                        </button>
                        <button
                            className="auth-logout-btn"
                            onClick={() => setCurlCommand('')}
                        >
                            {t('clearBtn')}
                        </button>
                    </div>

                    {response && (
                        <div className="try-it-response" style={{ marginTop: 20 }}>
                            <div className="try-it-response-header">
                                <span
                                    className="try-it-response-status"
                                    style={{
                                        color: response.status >= 200 && response.status < 300
                                            ? 'var(--status-200)'
                                            : response.status >= 400
                                                ? 'var(--status-500)'
                                                : 'var(--text-primary)',
                                    }}
                                >
                                    {response.status} {response.statusText}
                                </span>
                                <span className="try-it-response-time">{responseTime}ms</span>
                            </div>
                            <JsonViewer data={response.data} initialExpanded={true} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
