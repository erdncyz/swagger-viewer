import { useState } from 'react';
import { useSwagger } from '../context/SwaggerContext';
import { resolveSchema, getRefName, generateExample, getStatusClass } from '../utils/swagger';
import JsonViewer from './JsonViewer';
import SchemaViewer from './SchemaViewer';
import TryItPanel from './TryItPanel';

export default function EndpointDetail({ endpoint }) {
    const { spec } = useSwagger();
    const [activeTab, setActiveTab] = useState('overview');
    const [openResponses, setOpenResponses] = useState({});

    if (!endpoint) {
        return (
            <div className="detail-panel">
                <div className="detail-empty">
                    <div className="empty-icon">📡</div>
                    <p>Endpoint Seçin</p>
                    <span className="sub">Sol panelden bir endpoint seçerek detaylarını görüntüleyin</span>
                </div>
            </div>
        );
    }

    const toggleResponse = (code) => {
        setOpenResponses((prev) => ({ ...prev, [code]: !prev[code] }));
    };

    // Extract request body schema
    const requestBodySchema = endpoint.requestBody?.content?.['application/json']?.schema || null;
    const requestBodyExample = requestBodySchema ? generateExample(spec, requestBodySchema) : null;

    return (
        <div className="detail-panel">
            <div className="endpoint-detail" key={endpoint.id}>
                {/* Header */}
                <div className="endpoint-detail-header">
                    <div className="method-path">
                        <span className={`method-badge-lg ${endpoint.method.toLowerCase()}`}>
                            {endpoint.method}
                        </span>
                        <span className="path-text">{endpoint.path}</span>
                    </div>
                    {endpoint.summary && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>
                            {endpoint.summary}
                        </p>
                    )}
                    <div className="tags-row">
                        {endpoint.tags.map((tag) => (
                            <span key={tag} className="tag-pill">{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Tab Bar */}
                <div className="tab-bar">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        📋 Genel Bakış
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'schema' ? 'active' : ''}`}
                        onClick={() => setActiveTab('schema')}
                    >
                        🔧 Schema
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'example' ? 'active' : ''}`}
                        onClick={() => setActiveTab('example')}
                    >
                        📝 Örnek JSON
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'tryit' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tryit')}
                    >
                        🚀 Try It
                    </button>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <>
                        {/* Parameters */}
                        {endpoint.parameters.length > 0 && (
                            <div className="detail-section">
                                <div className="detail-section-title">Parametreler</div>
                                <table className="params-table">
                                    <thead>
                                        <tr>
                                            <th>Adı</th>
                                            <th>Konum</th>
                                            <th>Tip</th>
                                            <th>Açıklama</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {endpoint.parameters.map((param, idx) => {
                                            const schema = param.schema || param; // OpenAPI 3 vs Swagger 2
                                            const isEnum = schema.enum || (schema.items && schema.items.enum);

                                            return (
                                                <tr key={idx}>
                                                    <td>
                                                        <span className="param-name">{param.name}</span>
                                                        {param.required && <span className="param-required">*</span>}
                                                    </td>
                                                    <td><span className="param-in">{param.in}</span></td>
                                                    <td>
                                                        <code className="param-type">
                                                            {schema.type}
                                                            {schema.format ? ` (\$${schema.format})` : ''}
                                                            {schema.type === 'array' && schema.items ? `[${schema.items.type}]` : ''}
                                                        </code>
                                                        {isEnum && (
                                                            <div className="param-enum">
                                                                Allowed: {JSON.stringify(isEnum, null, 1).replace(/"/g, '').replace(/[\[\]]/g, '')}
                                                            </div>
                                                        )}
                                                        {schema.default !== undefined && (
                                                            <div className="param-default">
                                                                Default: {String(schema.default)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className="param-desc">
                                                            {param.description || '—'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Request Body */}
                        {requestBodySchema && (
                            <div className="detail-section">
                                <div className="detail-section-title">İstek Gövdesi (Request Body)</div>
                                <SchemaViewer spec={spec} schema={requestBodySchema} />
                            </div>
                        )}

                        {/* Responses */}
                        <div className="detail-section">
                            <div className="detail-section-title">Yanıtlar (Responses)</div>
                            {Object.entries(endpoint.responses).map(([code, response]) => {
                                const responseSchema = response.content?.['application/json']?.schema || null;
                                const isOpen = openResponses[code];

                                return (
                                    <div className="response-item" key={code}>
                                        <div className="response-header" onClick={() => toggleResponse(code)}>
                                            <span className={`status-code ${getStatusClass(code)}`}>{code}</span>
                                            <span className="response-desc">{response.description}</span>
                                            {responseSchema && (
                                                <span className={`response-toggle ${isOpen ? 'open' : ''}`}>▼</span>
                                            )}
                                        </div>
                                        {isOpen && responseSchema && (
                                            <div className="response-body">
                                                <SchemaViewer spec={spec} schema={responseSchema} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Schema Tab */}
                {activeTab === 'schema' && (
                    <div className="detail-section">
                        <div className="detail-section-title">Request Schema</div>
                        {requestBodySchema ? (
                            <SchemaViewer spec={spec} schema={requestBodySchema} />
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Bu endpoint için request body yok</p>
                        )}

                        {Object.entries(endpoint.responses).map(([code, response]) => {
                            const responseSchema = response.content?.['application/json']?.schema;
                            if (!responseSchema) return null;
                            return (
                                <div key={code} style={{ marginTop: 20 }}>
                                    <div className="detail-section-title">{code} Response Schema</div>
                                    <SchemaViewer spec={spec} schema={responseSchema} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Example JSON Tab */}
                {activeTab === 'example' && (
                    <div className="detail-section">
                        {requestBodyExample && (
                            <>
                                <div className="detail-section-title">Request Body Örneği</div>
                                <JsonViewer data={requestBodyExample} initialExpanded={true} />
                            </>
                        )}

                        {Object.entries(endpoint.responses).map(([code, response]) => {
                            const responseSchema = response.content?.['application/json']?.schema;
                            if (!responseSchema) return null;
                            const example = generateExample(spec, responseSchema);
                            if (!example) return null;
                            return (
                                <div key={code} style={{ marginTop: 20 }}>
                                    <div className="detail-section-title">{code} Response Örneği</div>
                                    <JsonViewer data={example} initialExpanded={true} />
                                </div>
                            );
                        })}

                        {!requestBodyExample && Object.keys(endpoint.responses).length === 0 && (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Bu endpoint için örnek veri oluşturulamadı</p>
                        )}
                    </div>
                )}

                {/* Try It Tab */}
                {activeTab === 'tryit' && (
                    <TryItPanel endpoint={endpoint} key={endpoint.id} />
                )}
            </div>
        </div>
    );
}
