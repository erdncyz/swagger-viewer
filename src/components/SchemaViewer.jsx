import { resolveSchema, getRefName } from '../utils/swagger';

/**
 * Renders an OpenAPI schema object recursively
 */
export default function SchemaViewer({ spec, schema, depth = 0 }) {
    if (!schema) return <span className="jv-null">—</span>;

    const resolved = resolveSchema(spec, schema);
    if (!resolved) {
        if (schema.$ref) {
            return (
                <div className="schema-viewer">
                    <span className="schema-property-type">{getRefName(schema.$ref)}</span>
                </div>
            );
        }
        return <span className="jv-null">Unknown schema</span>;
    }

    // Array type
    if (resolved.type === 'array') {
        return (
            <div className={depth === 0 ? 'schema-viewer' : ''}>
                <div className="schema-property">
                    <span className="schema-property-type">Array of:</span>
                </div>
                <div className="schema-indent">
                    <SchemaViewer spec={spec} schema={resolved.items} depth={depth + 1} />
                </div>
            </div>
        );
    }

    // Object type with properties
    if (resolved.type === 'object' || resolved.properties) {
        const requiredFields = resolved.required || [];
        const properties = resolved.properties || {};

        return (
            <div className={depth === 0 ? 'schema-viewer' : ''}>
                {schema.$ref && depth === 0 && (
                    <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                        📋 {getRefName(schema.$ref)}
                    </div>
                )}
                {Object.entries(properties).map(([name, propSchema]) => {
                    const propResolved = resolveSchema(spec, propSchema);
                    const isRequired = requiredFields.includes(name);
                    const isNested = propResolved &&
                        (propResolved.type === 'object' || propResolved.properties || propResolved.type === 'array');

                    return (
                        <div key={name}>
                            <div className="schema-property">
                                <span className="schema-property-name">{name}</span>
                                <span className="schema-property-type">
                                    {getSchemaTypeLabel(spec, propSchema)}
                                </span>
                                {isRequired && <span className="schema-property-required">required</span>}
                                {propSchema.description && (
                                    <span className="schema-property-desc">{propSchema.description}</span>
                                )}
                            </div>
                            {isNested && depth < 4 && (
                                <div className="schema-indent">
                                    <SchemaViewer spec={spec} schema={propSchema} depth={depth + 1} />
                                </div>
                            )}
                        </div>
                    );
                })}
                {Object.keys(properties).length === 0 && (
                    <span className="schema-property-type" style={{ fontStyle: 'italic' }}>
                        {resolved.additionalProperties ? 'Map / Dictionary' : 'Empty object'}
                    </span>
                )}
            </div>
        );
    }

    // Primitive or enum
    return (
        <div className={depth === 0 ? 'schema-viewer' : ''}>
            <span className="schema-property-type">
                {resolved.type || 'any'}
                {resolved.format ? ` (${resolved.format})` : ''}
                {resolved.enum ? ` enum: [${resolved.enum.join(', ')}]` : ''}
                {resolved.nullable ? ' | null' : ''}
            </span>
        </div>
    );
}

function getSchemaTypeLabel(spec, schema) {
    if (!schema) return 'any';
    if (schema.$ref) return getRefName(schema.$ref);

    const resolved = resolveSchema(spec, schema);
    if (!resolved) return 'any';

    if (resolved.type === 'array') {
        const itemType = resolved.items ? getSchemaTypeLabel(spec, resolved.items) : 'any';
        return `${itemType}[]`;
    }

    let label = resolved.type || 'any';
    if (resolved.format) label += `(${resolved.format})`;
    if (resolved.nullable) label += '?';

    return label;
}
