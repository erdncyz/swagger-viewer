import { useState, useEffect } from 'react';
import { SwaggerProvider, useSwagger } from './context/SwaggerContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Sidebar from './components/Sidebar';
import EndpointDetail from './components/EndpointDetail';
import AuthorizeModal from './components/AuthorizeModal';
import CurlRunnerModal from './components/CurlRunnerModal';
import './index.css';

function AppInner() {
  const { spec, endpoints, tags, loading, error, url, setUrl, apiInfo, fetchSpec, authToken } = useSwagger();
  const { t, language, toggleLanguage } = useLanguage();
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [inputUrl, setInputUrl] = useState(url);
  const [showAuth, setShowAuth] = useState(false);
  const [showCurlRunner, setShowCurlRunner] = useState(false);



  const handleLoadUrl = (e) => {
    e.preventDefault();
    setUrl(inputUrl);
    setSelectedEndpoint(null);
    fetchSpec(inputUrl);
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <div className="logo-icon">⚡</div>
          <h1>{t('appTitle')}</h1>
        </div>

        {apiInfo && (
          <span className="api-title">
            {apiInfo.title} {apiInfo.version ? `v${apiInfo.version}` : ''}
          </span>
        )}

        <form className="url-input-wrapper" onSubmit={handleLoadUrl}>
          <span className="url-icon">🌐</span>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder={t('urlPlaceholder')}
            id="swagger-url-input"
          />
        </form>

        <button
          className="url-load-btn"
          onClick={handleLoadUrl}
          disabled={loading}
          id="load-swagger-btn"
        >
          {loading ? t('loadingBtn') : t('loadBtn')}
        </button>

        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button
            className="authorize-btn"
            onClick={toggleLanguage}
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              width: 40,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
            title="Dil Değiştir / Switch Language"
          >
            {language === 'tr' ? 'TR' : 'EN'}
          </button>

          <button
            className="authorize-btn"
            onClick={() => setShowCurlRunner(true)}
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-accent)',
              border: '1px solid var(--border-color)'
            }}
          >
            {t('runCurlBtn')}
          </button>

          {spec && (
            <button
              className={`authorize-btn ${authToken ? 'authorized' : ''}`}
              onClick={() => setShowAuth(true)}
              id="authorize-btn"
            >
              🔐 {authToken ? t('authorizedBtn') : t('authorizeBtn')}
            </button>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      {showAuth && <AuthorizeModal onClose={() => setShowAuth(false)} />}

      {/* Curl Runner Modal */}
      {showCurlRunner && <CurlRunnerModal onClose={() => setShowCurlRunner(false)} />}

      {/* Main Content */}
      <main className="app-content">
        {loading && (
          <div style={{ flex: 1 }}>
            <div className="loading-screen">
              <div className="loading-spinner" />
              <span className="loading-text">{t('loadingScreen')}</span>
            </div>
          </div>
        )}

        {error && !loading && (
          <div style={{ flex: 1 }}>
            <div className="error-screen">
              <div className="error-icon">⚠️</div>
              <h2>{t('errorScreen')}</h2>
              <p>{error}</p>
              <button className="retry-btn" onClick={() => fetchSpec()} id="retry-btn">
                {t('retryBtn')}
              </button>
            </div>
          </div>
        )}

        {spec && !loading && !error && (
          <>
            <Sidebar
              tags={tags}
              endpoints={endpoints}
              selectedEndpoint={selectedEndpoint}
              onSelect={setSelectedEndpoint}
            />
            <EndpointDetail endpoint={selectedEndpoint} />
          </>
        )}

        {!spec && !loading && !error && (
          <div className="welcome-screen">
            <div className="welcome-content">
              <div className="welcome-icon">⚡</div>
              <h2>{t('welcomeTitle')}</h2>
              <p>{t('welcomeDesc')} <strong>{t('loadBtn')}</strong> {t('welcomeClick')}</p>

              <div className="welcome-chips">
                <span className="welcome-chip">OpenAPI 3.0</span>
                <span className="welcome-chip">Swagger 2.0</span>
                <span className="welcome-chip">JSON Schema</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <SwaggerProvider>
        <AppInner />
      </SwaggerProvider>
    </LanguageProvider>
  );
}
