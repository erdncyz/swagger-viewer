import { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const translations = {
    tr: {
        // App
        appTitle: 'API Explorer',
        urlPlaceholder: "Swagger JSON URL'sini girin...",
        loadBtn: 'Yükle',
        loadingBtn: 'Yükleniyor...',
        authorizeBtn: 'Authorize',
        authorizedBtn: 'Yetkilendirildi',
        runCurlBtn: 'Run cURL',
        welcomeTitle: "API Explorer'a Hoş Geldiniz",
        welcomeDesc: "Başlamak için yukarıdaki kutuya bir Swagger/OpenAPI JSON URL'si girin ve",
        welcomeClick: "Yükle butonuna tıklayın.",
        loadingScreen: 'Swagger spesifikasyonu yükleniyor...',
        errorScreen: 'Yükleme Hatası',
        retryBtn: 'Tekrar Dene',

        // Sidebar
        searchPlaceholder: 'Endpoint ara... (path veya tag)',
        noResults: 'Sonuç bulunamadı',
        noEndpoints: 'Endpoint yok',
        endpointCount: 'endpoint',

        // Try It Panel
        tryItTitle: '🚀 Try It — İstek Gönder',
        pathParams: 'Path Parametreleri',
        queryParams: 'Query Parametreleri',
        headerParams: 'Header Parametreleri',
        requestBody: 'Request Body (JSON)',
        sendBtn: '🚀 Gönder',
        sendingBtn: 'Gönderiliyor...',
        copyBtn: '📋 Kopyala',
        curlLabel: 'cURL',

        // Authorize Modal
        authTitle: '🔐 Yetkilendirme (Authorize)',
        noAuthScheme: 'Bu API için tanımlı güvenlik şeması bulunamadı.',
        authBtn: '🔓 Yetkilendir',
        logoutBtn: '🚪 Çıkış',
        closeBtn: 'Kapat',
        authorizedStatus: '✅ Yetkilendirildi — Token aktif',
        tokenContent: 'Token İçeriği (Decoded)',
        header: 'Header',
        payload: 'Payload',

        // Curl Runner
        runnerTitle: '🏃 Run cURL / Raw Request',
        runnerLabel: 'cURL Command',
        runBtn: '🚀 Çalıştır (Execute)',
        runningBtn: 'Çalıştırılıyor...',
        clearBtn: 'Temizle',
        runnerPlaceholder: "curl -X POST 'https://api.example.com/v1/resource' ...",

        // Json Viewer
        copy: '📋 Kopyala',
        copied: '✓ Kopyalandı',
        items: 'items',
        keys: 'keys',

        // Endpoint Detail
        paramsTitle: 'PARAMETRELER',
        responsesTitle: 'YANITLAR (RESPONSES)',
        noParams: 'Parametre yok',
        name: 'İSİM',
        in: 'TİP (IN)',
        required: 'ZORUNLU',
        type: 'VERİ TİPİ',
        desc: 'AÇIKLAMA',
        example: 'ÖRNEK',
        schema: 'SCHEMA',

    },
    en: {
        // App
        appTitle: 'API Explorer',
        urlPlaceholder: 'Enter Swagger JSON URL...',
        loadBtn: 'Load',
        loadingBtn: 'Loading...',
        authorizeBtn: 'Authorize',
        authorizedBtn: 'Authorized',
        runCurlBtn: 'Run cURL',
        welcomeTitle: 'Welcome to API Explorer',
        welcomeDesc: 'To get started, enter a Swagger/OpenAPI JSON URL above and click',
        welcomeClick: 'Load button.',
        loadingScreen: 'Loading Swagger specification...',
        errorScreen: 'Load Error',
        retryBtn: 'Retry',

        // Sidebar
        searchPlaceholder: 'Search endpoints... (path or tag)',
        noResults: 'No results found',
        noEndpoints: 'No endpoints',
        endpointCount: 'endpoints',

        // Try It Panel
        tryItTitle: '🚀 Try It — Send Request',
        pathParams: 'Path Parameters',
        queryParams: 'Query Parameters',
        headerParams: 'Header Parameters',
        requestBody: 'Request Body (JSON)',
        sendBtn: '🚀 Send',
        sendingBtn: 'Sending...',
        copyBtn: '📋 Copy',
        curlLabel: 'cURL',

        // Authorize Modal
        authTitle: '🔐 Authorization',
        noAuthScheme: 'No security schemes defined for this API.',
        authBtn: '🔓 Authorize',
        logoutBtn: '🚪 Logout',
        closeBtn: 'Close',
        authorizedStatus: '✅ Authorized — Token active',
        tokenContent: 'Token Content (Decoded)',
        header: 'Header',
        payload: 'Payload',

        // Curl Runner
        runnerTitle: '🏃 Run cURL / Raw Request',
        runnerLabel: 'cURL Command',
        runBtn: '🚀 Execute',
        runningBtn: 'Running...',
        clearBtn: 'Clear',
        runnerPlaceholder: "curl -X POST 'https://api.example.com/v1/resource' ...",

        // Json Viewer
        copy: '📋 Copy',
        copied: '✓ Copied',
        items: 'items',
        keys: 'keys',

        // Endpoint Detail
        paramsTitle: 'PARAMETERS',
        responsesTitle: 'RESPONSES',
        noParams: 'No parameters',
        name: 'NAME',
        in: 'IN',
        required: 'REQUIRED',
        type: 'DATA TYPE',
        desc: 'DESCRIPTION',
        example: 'EXAMPLE',
        schema: 'SCHEMA',
    }
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('tr');

    const t = (key) => {
        return translations[language][key] || key;
    };

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'tr' ? 'en' : 'tr'));
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
