import { useState, useCallback, useMemo } from 'react';
import { useSwagger } from '../context/SwaggerContext';
import { generateExample, resolveSchema } from '../utils/swagger';
import JsonViewer from './JsonViewer';

import { useLanguage } from '../context/LanguageContext';

export default function TryItPanel({ endpoint }) {
    const { t } = useLanguage();
    const { spec, authToken } = useSwagger();
    const [headerValues, setHeaderValues] = useState(() => {
        const initial = {};
        (endpoint.parameters || []).forEach((p) => {
            if (p.in === 'header' && p.example !== undefined) initial[p.name] = String(p.example);
        });
        return initial;
    });

    const [queryValues, setQueryValues] = useState(() => {
        const initial = {};
        (endpoint.parameters || []).forEach((p) => {
            // Check for default or example
            const schema = p.schema || p;
            if (p.in === 'query') {
                if (schema.default !== undefined) initial[p.name] = String(schema.default);
                else if (p.example !== undefined) initial[p.name] = String(p.example);
            }
        });
        return initial;
    });

    const [pathValues, setPathValues] = useState(() => {
        const initial = {};
        (endpoint.parameters || []).forEach((p) => {
            if (p.in === 'path' && p.example !== undefined) initial[p.name] = String(p.example);
        });
        return initial;
    });

    const [bodyText, setBodyText] = useState(() => {
        if (endpoint.requestBody) {
            const content = endpoint.requestBody.content;
            const jsonContent = content?.['application/json'];
            if (jsonContent?.schema) {
                const example = generateExample(spec, jsonContent.schema);
                return JSON.stringify(example, null, 2);
            }
        }
        return '';
    });
    const [response, setResponse] = useState(null);
    const [responseTime, setResponseTime] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleHeaderChange = (name, value) => {
        setHeaderValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleQueryChange = (name, value) => {
        setQueryValues((prev) => ({ ...prev, [name]: value }));
    };

    const handlePathChange = (name, value) => {
        setPathValues((prev) => ({ ...prev, [name]: value }));
    };

    // Construct Full URL
    const fullUrl = useMemo(() => {
        const baseUrl = spec?.servers?.[0]?.url || '';
        let urlPath = endpoint.path;

        // Replace path params
        Object.keys(pathValues).forEach(key => {
            if (pathValues[key]) {
                urlPath = urlPath.replace(`{${key}}`, pathValues[key]);
            }
        });

        // Append query params
        const queryParams = new URLSearchParams();
        Object.keys(queryValues).forEach(key => {
            if (queryValues[key]) {
                queryParams.append(key, queryValues[key]);
            }
        });

        const queryString = queryParams.toString();
        return (baseUrl.replace(/\/$/, '') + urlPath) + (queryString ? `?${queryString}` : '');
    }, [spec, endpoint, pathValues, queryValues]);

    // Construct Headers
    const requestHeaders = useMemo(() => {
        const headers = {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        };

        (endpoint.parameters || []).forEach((p) => {
            if (p.in === 'header' && headerValues[p.name]) {
                headers[p.name] = headerValues[p.name];
            }
        });

        return headers;
    }, [endpoint, headerValues, authToken]);

    // Generate cURL Command
    const curlCommand = useMemo(() => {
        let cmd = `curl -X ${endpoint.method} "${fullUrl}"`;

        Object.entries(requestHeaders).forEach(([key, value]) => {
            cmd += ` \\\n  -H "${key}: ${value}"`;
        });

        if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && bodyText) {
            // Escape single quotes for shell safety (basic)
            const escapedBody = bodyText.replace(/'/g, "'\\''");
            cmd += ` \\\n  -d '${escapedBody}'`;
        }

        return cmd;
    }, [endpoint.method, fullUrl, requestHeaders, bodyText]);

    const handleCopyCurl = () => {
        navigator.clipboard.writeText(curlCommand);
    };

    const handleSend = useCallback(async () => {
        setLoading(true);
        setResponse(null);

        const options = {
            method: endpoint.method,
            headers: requestHeaders,
        };

        if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && bodyText) {
            options.body = bodyText;
        }

        const startTime = performance.now();

        try {
            const res = await fetch(fullUrl, options);
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
            setResponseTime(Math.round(performance.now() - startTime));
            setResponse({
                status: 0,
                statusText: 'Network Error',
                data: { error: err.message },
            });
        }

        setLoading(false);
    }, [endpoint, requestHeaders, bodyText, fullUrl]);

    const headerParams = (endpoint.parameters || []).filter((p) => p.in === 'header');
    const queryParams = (endpoint.parameters || []).filter((p) => p.in === 'query');
    const pathParams = (endpoint.parameters || []).filter((p) => p.in === 'path');
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.requestBody;

    return (
        <div className="try-it-panel">
            <div className="try-it-header" onClick={() => setIsOpen(!isOpen)}>
                <h3>{t('tryItTitle')}</h3>
                <span className={`response-toggle ${isOpen ? 'open' : ''}`}>▼</span>
            </div>

            {isOpen && (
                <div className="try-it-body">
                    {/* Path Parameters */}
                    {pathParams.length > 0 && (
                        <>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                                {t('pathParams')}
                            </div>
                            {pathParams.map((param) => (
                                <div className="try-it-form-group" key={param.name}>
                                    <label>
                                        {param.name}
                                        {param.required && <span style={{ color: 'var(--method-delete)', marginLeft: 4 }}>*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={pathValues[param.name] || ''}
                                        onChange={(e) => handlePathChange(param.name, e.target.value)}
                                        placeholder={param.description || param.name}
                                    />
                                </div>
                            ))}
                        </>
                    )}

                    {/* Query Parameters */}
                    {queryParams.length > 0 && (
                        <>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, marginTop: 12 }}>
                                {t('queryParams')}
                            </div>
                            {queryParams.map((param) => (
                                <div className="try-it-form-group" key={param.name}>
                                    <label>
                                        {param.name}
                                        {param.required && <span style={{ color: 'var(--method-delete)', marginLeft: 4 }}>*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={queryValues[param.name] || ''}
                                        onChange={(e) => handleQueryChange(param.name, e.target.value)}
                                        placeholder={param.description || param.name}
                                    />
                                </div>
                            ))}
                        </>
                    )}

                    {/* Header parameters */}
                    {headerParams.length > 0 && (
                        <>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, marginTop: 12 }}>
                                {t('headerParams')}
                            </div>
                            {headerParams.map((param) => (
                                <div className="try-it-form-group" key={param.name}>
                                    <label>
                                        {param.name}
                                        {param.required && <span style={{ color: 'var(--method-delete)', marginLeft: 4 }}>*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={headerValues[param.name] || ''}
                                        onChange={(e) => handleHeaderChange(param.name, e.target.value)}
                                        placeholder={param.description || param.name}
                                    />
                                </div>
                            ))}
                        </>
                    )}

                    {/* Request body */}
                    {hasBody && (
                        <div className="try-it-form-group" style={{ marginTop: 12 }}>
                            <label>{t('requestBody')}</label>
                            <textarea
                                value={bodyText}
                                onChange={(e) => setBodyText(e.target.value)}
                                placeholder='{ "key": "value" }'
                            />
                        </div>
                    )}

                    {/* cURL Display */}
                    <div style={{ marginTop: 20, marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <label style={{ margin: 0 }}>{t('curlLabel')}</label>
                            <button
                                onClick={handleCopyCurl}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-secondary)',
                                    padding: '2px 8px',
                                    fontSize: 11,
                                    borderRadius: 4,
                                    cursor: 'pointer'
                                }}
                            >
                                {t('copyBtn')}
                            </button>
                        </div>
                        <pre style={{
                            background: 'var(--bg-secondary)',
                            padding: 12,
                            borderRadius: 6,
                            fontSize: 12,
                            overflowX: 'auto',
                            color: 'var(--text-primary)',
                            fontFamily: 'monospace',
                            border: '1px solid var(--border-color)',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {curlCommand}
                        </pre>
                    </div>

                    {/* Send button */}
                    <button
                        className="try-it-send-btn"
                        onClick={handleSend}
                        disabled={loading}
                        id="send-request-btn"
                    >
                        {loading ? (
                            <>
                                <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                {t('sendingBtn')}
                            </>
                        ) : (
                            <>{t('sendBtn')}</>
                        )}
                    </button>

                    {/* Response */}
                    {response && (
                        <div className="try-it-response">
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
            )}
        </div>
    );
}
