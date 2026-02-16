import { useState, useCallback } from 'react';

/**
 * Collapsible JSON viewer with syntax highlighting
 */
import { useLanguage } from '../context/LanguageContext';

export default function JsonViewer({ data, initialExpanded = true, maxDepth = 6 }) {
    const { t } = useLanguage();
    const [copiedState, setCopiedState] = useState(false);

    const handleCopy = useCallback(() => {
        const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        navigator.clipboard.writeText(text).then(() => {
            setCopiedState(true);
            setTimeout(() => setCopiedState(false), 2000);
        });
    }, [data]);

    if (data === undefined || data === null) {
        return (
            <div className="json-viewer">
                <span className="jv-null">null</span>
            </div>
        );
    }

    const parsed = typeof data === 'string' ? (() => { try { return JSON.parse(data); } catch { return data; } })() : data;

    return (
        <div className="json-viewer">
            <div className="jv-toolbar">
                <button className={`jv-btn ${copiedState ? 'copied' : ''}`} onClick={handleCopy}>
                    {copiedState ? t('copied') : t('copy')}
                </button>
            </div>
            <div style={{ paddingTop: 8 }}>
                <JsonNode value={parsed} depth={0} initialExpanded={initialExpanded} maxDepth={maxDepth} />
            </div>
        </div>
    );
}

function JsonNode({ value, depth, keyName, initialExpanded, maxDepth, isLast = true }) {
    const [expanded, setExpanded] = useState(depth < (initialExpanded ? 3 : 1));

    if (value === null) {
        return (
            <div className="jv-line">
                <Indent depth={depth} />
                {keyName !== undefined && <><span className="jv-key">"{keyName}"</span>: </>}
                <span className="jv-null">null</span>
                {!isLast && ','}
            </div>
        );
    }

    if (typeof value === 'string') {
        return (
            <div className="jv-line">
                <Indent depth={depth} />
                {keyName !== undefined && <><span className="jv-key">"{keyName}"</span>: </>}
                <span className="jv-string">"{value}"</span>
                {!isLast && ','}
            </div>
        );
    }

    if (typeof value === 'number') {
        return (
            <div className="jv-line">
                <Indent depth={depth} />
                {keyName !== undefined && <><span className="jv-key">"{keyName}"</span>: </>}
                <span className="jv-number">{value}</span>
                {!isLast && ','}
            </div>
        );
    }

    if (typeof value === 'boolean') {
        return (
            <div className="jv-line">
                <Indent depth={depth} />
                {keyName !== undefined && <><span className="jv-key">"{keyName}"</span>: </>}
                <span className="jv-boolean">{value.toString()}</span>
                {!isLast && ','}
            </div>
        );
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return (
                <div className="jv-line">
                    <Indent depth={depth} />
                    {keyName !== undefined && <><span className="jv-key">"{keyName}"</span>: </>}
                    <span className="jv-bracket">[]</span>
                    {!isLast && ','}
                </div>
            );
        }

        if (depth >= maxDepth) {
            return (
                <div className="jv-line">
                    <Indent depth={depth} />
                    {keyName !== undefined && <><span className="jv-key">"{keyName}"</span>: </>}
                    <span className="jv-bracket">[</span>
                    <span className="jv-collapsed-info">...{value.length} {t('items')}</span>
                    <span className="jv-bracket">]</span>
                    {!isLast && ','}
                </div>
            );
        }

        return (
            <>
                <div className="jv-line">
                    <Indent depth={depth} />
                    <span className="jv-toggle" onClick={() => setExpanded(!expanded)}>
                        {expanded ? '▼' : '▶'}
                    </span>
                    {keyName !== undefined && <><span className="jv-key">"{keyName}"</span>: </>}
                    <span className="jv-bracket">[</span>
                    {!expanded && (
                        <>
                            <span className="jv-collapsed-info">{value.length} {t('items')}</span>
                            <span className="jv-bracket">]</span>
                            {!isLast && ','}
                        </>
                    )}
                </div>
                {expanded && (
                    <>
                        {value.map((item, i) => (
                            <JsonNode
                                key={i}
                                value={item}
                                depth={depth + 1}
                                initialExpanded={initialExpanded}
                                maxDepth={maxDepth}
                                isLast={i === value.length - 1}
                            />
                        ))}
                        <div className="jv-line">
                            <Indent depth={depth} />
                            <span className="jv-bracket">]</span>
                            {!isLast && ','}
                        </div>
                    </>
                )}
            </>
        );
    }

    if (typeof value === 'object') {
        const entries = Object.entries(value);

        if (entries.length === 0) {
            return (
                <div className="jv-line">
                    <Indent depth={depth} />
                    {keyName !== undefined && <><span className="jv-key">"{keyName}"</span>: </>}
                    <span className="jv-bracket">{'{}'}</span>
                    {!isLast && ','}
                </div>
            );
        }

        if (depth >= maxDepth) {
            return (
                <div className="jv-line">
                    <Indent depth={depth} />
                    {keyName !== undefined && <><span className="jv-key">"{keyName}"</span>: </>}
                    <span className="jv-bracket">{'{'}</span>
                    <span className="jv-collapsed-info">...{entries.length} {t('keys')}</span>
                    <span className="jv-bracket">{'}'}</span>
                    {!isLast && ','}
                </div>
            );
        }

        return (
            <>
                <div className="jv-line">
                    <Indent depth={depth} />
                    <span className="jv-toggle" onClick={() => setExpanded(!expanded)}>
                        {expanded ? '▼' : '▶'}
                    </span>
                    {keyName !== undefined && <><span className="jv-key">"{keyName}"</span>: </>}
                    <span className="jv-bracket">{'{'}</span>
                    {!expanded && (
                        <>
                            <span className="jv-collapsed-info">{entries.length} {t('keys')}</span>
                            <span className="jv-bracket">{'}'}</span>
                            {!isLast && ','}
                        </>
                    )}
                </div>
                {expanded && (
                    <>
                        {entries.map(([k, v], i) => (
                            <JsonNode
                                key={k}
                                keyName={k}
                                value={v}
                                depth={depth + 1}
                                initialExpanded={initialExpanded}
                                maxDepth={maxDepth}
                                isLast={i === entries.length - 1}
                            />
                        ))}
                        <div className="jv-line">
                            <Indent depth={depth} />
                            <span className="jv-bracket">{'}'}</span>
                            {!isLast && ','}
                        </div>
                    </>
                )}
            </>
        );
    }

    return (
        <div className="jv-line">
            <Indent depth={depth} />
            {keyName !== undefined && <><span className="jv-key">"{keyName}"</span>: </>}
            <span>{String(value)}</span>
            {!isLast && ','}
        </div>
    );
}

function Indent({ depth }) {
    return (
        <>
            {Array.from({ length: depth }).map((_, i) => (
                <span key={i} className="jv-indent" />
            ))}
        </>
    );
}
