import { useState, useMemo, useEffect } from 'react';

import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({ tags, endpoints, selectedEndpoint, onSelect }) {
    const { t } = useLanguage();
    const [search, setSearch] = useState('');
    const [expandedTags, setExpandedTags] = useState({});

    // Reset expanded tags when tags change
    useEffect(() => {
        const initial = {};
        Object.keys(tags).forEach((tag) => (initial[tag] = false));
        setExpandedTags(initial);
    }, [tags]);

    const filteredTags = useMemo(() => {
        if (!search.trim()) return tags;

        const query = search.toLowerCase();
        const result = {};
        for (const [tag, tagEndpoints] of Object.entries(tags)) {
            const matched = tagEndpoints.filter(
                (ep) =>
                    ep.path.toLowerCase().includes(query) ||
                    ep.method.toLowerCase().includes(query) ||
                    tag.toLowerCase().includes(query)
            );
            if (matched.length > 0) result[tag] = matched;
        }
        return result;
    }, [tags, search]);

    const toggleTag = (tag) => {
        setExpandedTags((prev) => ({ ...prev, [tag]: !prev[tag] }));
    };

    const tagNames = Object.keys(filteredTags).sort();

    // method counts
    const methodCounts = useMemo(() => {
        const counts = { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0 };
        endpoints.forEach((ep) => {
            if (counts[ep.method] !== undefined) counts[ep.method]++;
        });
        return counts;
    }, [endpoints]);

    return (
        <aside className="sidebar">
            <div className="sidebar-search">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    id="endpoint-search"
                />
            </div>

            <div className="sidebar-stats">
                <span>
                    <span className="stat-dot" style={{ background: 'var(--text-accent)' }} />
                    {endpoints.length} {t('endpointCount')}
                </span>
                <span>
                    <span className="stat-dot" style={{ background: 'var(--method-get)' }} />
                    {methodCounts.GET} GET
                </span>
                <span>
                    <span className="stat-dot" style={{ background: 'var(--method-post)' }} />
                    {methodCounts.POST} POST
                </span>
                <span>
                    <span className="stat-dot" style={{ background: 'var(--method-put)' }} />
                    {methodCounts.PUT} PUT
                </span>
                <span>
                    <span className="stat-dot" style={{ background: 'var(--method-delete)' }} />
                    {methodCounts.DELETE} DEL
                </span>
            </div>

            <div className="sidebar-endpoints">
                {tagNames.length === 0 && (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                        {search ? t('noResults') : t('noEndpoints')}
                    </div>
                )}

                {tagNames.map((tag) => (
                    <div className="tag-group" key={tag}>
                        <div className="tag-header" onClick={() => toggleTag(tag)}>
                            <span className={`tag-icon ${expandedTags[tag] ? 'expanded' : ''}`}>▶</span>
                            <span className="tag-name">{tag}</span>
                            <span className="tag-count">{filteredTags[tag].length}</span>
                        </div>

                        {expandedTags[tag] && (
                            <div className="tag-endpoints">
                                {filteredTags[tag].map((ep) => (
                                    <div
                                        key={ep.id}
                                        className={`endpoint-item ${selectedEndpoint?.id === ep.id ? 'active' : ''}`}
                                        onClick={() => onSelect(ep)}
                                        id={`ep-${ep.id}`}
                                    >
                                        <span className={`method-badge ${ep.method.toLowerCase()}`}>
                                            {ep.method}
                                        </span>
                                        <span className="endpoint-path" title={ep.path}>
                                            {ep.path}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </aside>
    );
}
