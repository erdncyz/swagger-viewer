import { useState, useEffect } from 'react';
import { useSwagger } from '../context/SwaggerContext';
import JsonViewer from './JsonViewer';

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function parseJwtHeader(token) {
    try {
        const base64Url = token.split('.')[0];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

import { useLanguage } from '../context/LanguageContext';

export default function AuthorizeModal({ onClose }) {
    const { t } = useLanguage();
    const { spec, authToken, setAuthToken } = useSwagger();
    const [tokenInput, setTokenInput] = useState(authToken || '');
    const [decodedToken, setDecodedToken] = useState(null);
    const [decodedHeader, setDecodedHeader] = useState(null);

    // Extract security schemes from spec
    const securitySchemes = spec?.components?.securitySchemes || {};
    const schemeEntries = Object.entries(securitySchemes);

    useEffect(() => {
        if (tokenInput && tokenInput.includes('.')) {
            setDecodedToken(parseJwt(tokenInput));
            setDecodedHeader(parseJwtHeader(tokenInput));
        } else {
            setDecodedToken(null);
            setDecodedHeader(null);
        }
    }, [tokenInput]);

    const handleAuthorize = () => {
        setAuthToken(tokenInput);
    };

    const handleLogout = () => {
        setTokenInput('');
        setAuthToken('');
    };

    return (
        <div className="auth-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                <div className="auth-modal-header">
                    <h2>{t('authTitle')}</h2>
                    <button className="auth-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="auth-modal-body">
                    {schemeEntries.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                            {t('noAuthScheme')}
                        </p>
                    ) : (
                        schemeEntries.map(([name, scheme]) => (
                            <div key={name} className="auth-scheme">
                                <div className="auth-scheme-header">
                                    <span className="auth-scheme-name">{name}</span>
                                    <span className="auth-scheme-type">
                                        {scheme.type === 'http' && scheme.scheme === 'bearer'
                                            ? `Bearer (${scheme.bearerFormat || 'Token'})`
                                            : scheme.type === 'apiKey'
                                                ? `API Key (${scheme.in}: ${scheme.name})`
                                                : scheme.type}
                                    </span>
                                </div>

                                {scheme.description && (
                                    <p className="auth-scheme-desc">{scheme.description}</p>
                                )}

                                <div className="auth-input-group">
                                    <label>
                                        {scheme.type === 'http' && scheme.scheme === 'bearer'
                                            ? 'Bearer Token (JWT)'
                                            : 'Value'}
                                    </label>
                                    <div className="auth-input-row">
                                        <input
                                            type="text"
                                            value={tokenInput}
                                            onChange={(e) => setTokenInput(e.target.value)}
                                            placeholder={
                                                scheme.type === 'http' && scheme.scheme === 'bearer'
                                                    ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                                                    : 'Token değerini girin...'
                                            }
                                            id="auth-token-input"
                                            className="auth-input"
                                        />
                                    </div>
                                </div>

                                {/* Decode JWT Visualization */}
                                {(decodedToken || decodedHeader) && (
                                    <div className="jwt-decode-section">
                                        <div className="jwt-section-title">{t('tokenContent')}</div>
                                        <div className="jwt-columns">
                                            {decodedHeader && (
                                                <div className="jwt-column">
                                                    <div className="jwt-label">{t('header')}</div>
                                                    <div className="jwt-viewer-wrapper">
                                                        <JsonViewer data={decodedHeader} initialExpanded={true} />
                                                    </div>
                                                </div>
                                            )}
                                            {decodedToken && (
                                                <div className="jwt-column">
                                                    <div className="jwt-label">{t('payload')}</div>
                                                    <div className="jwt-viewer-wrapper">
                                                        <JsonViewer data={decodedToken} initialExpanded={true} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="auth-actions">
                                    <button
                                        className="auth-authorize-btn"
                                        onClick={handleAuthorize}
                                        disabled={!tokenInput.trim()}
                                        id="auth-authorize-btn"
                                    >
                                        {t('authBtn')}
                                    </button>
                                    <button
                                        className="auth-logout-btn"
                                        onClick={handleLogout}
                                        id="auth-logout-btn"
                                    >
                                        {t('logoutBtn')}
                                    </button>
                                </div>

                                {authToken && (
                                    <div className="auth-status authorized">
                                        {t('authorizedStatus')}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="auth-modal-footer">
                    <button className="auth-done-btn" onClick={onClose} id="auth-done-btn">
                        {t('closeBtn')}
                    </button>
                </div>
            </div>
        </div>
    );
}
