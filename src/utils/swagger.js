/**
 * Swagger/OpenAPI utility functions
 */

/**
 * Resolve a $ref path like "#/components/schemas/SomeName" to the actual object
 */
export function resolveRef(spec, ref) {
  if (!ref || !ref.startsWith('#/')) return null;
  const parts = ref.replace('#/', '').split('/');
  let current = spec;
  for (const part of parts) {
    if (current && current[part] !== undefined) {
      current = current[part];
    } else {
      return null;
    }
  }
  return current;
}

/**
 * Resolve schema — handles $ref at any level
 */
export function resolveSchema(spec, schema) {
  if (!schema) return null;
  if (schema.$ref) {
    return resolveRef(spec, schema.$ref);
  }
  return schema;
}

/**
 * Get a clean name from a $ref path
 */
export function getRefName(ref) {
  if (!ref) return '';
  const parts = ref.split('/');
  const name = parts[parts.length - 1];
  // clean up .NET-style generic names
  return name
    .replace(/`\d+\[\[.*?\]\]/g, '')
    .replace(/_/g, '.');
}

/**
 * Convert Swagger 2.0 spec to OpenAPI 3.0-like structure
 */
export function convertSwagger2ToOpenApi3(spec, sourceUrl) {
  if (!spec.swagger || !spec.swagger.startsWith('2')) return spec;

  const converted = { ...spec, openapi: '3.0.0' };

  // Move definitions to components/schemas
  if (spec.definitions) {
    converted.components = converted.components || {};
    converted.components.schemas = spec.definitions;
  }

  // Convert host/basePath to servers
  let host = spec.host;
  let scheme = spec.schemes && spec.schemes.length > 0 ? spec.schemes[0] : 'https';

  if (!host && sourceUrl) {
    try {
      const u = new URL(sourceUrl);
      host = u.host;
      scheme = u.protocol.replace(':', '');
    } catch (e) {
      // ignore invalid sourceUrl
    }
  }

  if (host) {
    const basePath = spec.basePath || '';
    const url = `${scheme}://${host}${basePath}`;
    converted.servers = [{ url }];
  }

  // Convert each path's operations
  if (spec.paths) {
    const newPaths = {};
    for (const [path, methods] of Object.entries(spec.paths)) {
      newPaths[path] = {};
      for (const [method, operation] of Object.entries(methods)) {
        if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
          const newOp = { ...operation };

          // Convert body parameters to requestBody
          if (operation.parameters) {
            const bodyParam = operation.parameters.find((p) => p.in === 'body');
            const nonBodyParams = operation.parameters.filter((p) => p.in !== 'body');
            newOp.parameters = nonBodyParams;

            if (bodyParam && bodyParam.schema) {
              // Convert #/definitions/X to #/components/schemas/X
              const schema = JSON.parse(
                JSON.stringify(bodyParam.schema).replace(/#\/definitions\//g, '#/components/schemas/')
              );
              newOp.requestBody = {
                content: { 'application/json': { schema } },
                required: bodyParam.required || false,
              };
            }
          }

          // Convert responses schemas
          if (operation.responses) {
            const newResponses = {};
            for (const [code, resp] of Object.entries(operation.responses)) {
              const newResp = { ...resp };
              if (resp.schema) {
                const schema = JSON.parse(
                  JSON.stringify(resp.schema).replace(/#\/definitions\//g, '#/components/schemas/')
                );
                newResp.content = { 'application/json': { schema } };
                delete newResp.schema;
              }
              newResponses[code] = newResp;
            }
            newOp.responses = newResponses;
          }

          newPaths[path][method] = newOp;
        }
      }
    }
    converted.paths = newPaths;
  }

  return converted;
}

/**
 * Parse all endpoints from an OpenAPI spec and group by tag
 */
export function parseEndpoints(spec) {
  if (!spec || !spec.paths) return { endpoints: [], tags: {} };

  const endpoints = [];
  const tags = {};

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
        const endpoint = {
          id: `${method.toUpperCase()}-${path}`,
          path,
          method: method.toUpperCase(),
          tags: operation.tags || ['Untagged'],
          parameters: operation.parameters || [],
          requestBody: operation.requestBody || null,
          responses: operation.responses || {},
          summary: operation.summary || '',
          description: operation.description || '',
          operationId: operation.operationId || '',
        };

        endpoints.push(endpoint);

        for (const tag of endpoint.tags) {
          if (!tags[tag]) tags[tag] = [];
          tags[tag].push(endpoint);
        }
      }
    }
  }

  return { endpoints, tags };
}

/**
 * Generate example JSON from an OpenAPI schema
 */
export function generateExample(spec, schema, visited = new Set()) {
  if (!schema) return null;

  // resolve $ref
  if (schema.$ref) {
    if (visited.has(schema.$ref)) return '...circular ref...';
    visited.add(schema.$ref);
    const resolved = resolveRef(spec, schema.$ref);
    if (!resolved) return null;
    return generateExample(spec, resolved, visited);
  }

  if (schema.example !== undefined) return schema.example;

  if (schema.type === 'object' || schema.properties) {
    const obj = {};
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        obj[key] = generateExample(spec, propSchema, new Set(visited));
      }
    }
    return obj;
  }

  if (schema.type === 'array') {
    const item = generateExample(spec, schema.items, new Set(visited));
    return item !== null ? [item] : [];
  }

  // primitive defaults
  switch (schema.type) {
    case 'string':
      if (schema.format === 'date-time') return '2024-01-01T00:00:00Z';
      if (schema.format === 'date') return '2024-01-01';
      if (schema.format === 'email') return 'user@example.com';
      if (schema.format === 'uri') return 'https://example.com';
      if (schema.enum) return schema.enum[0];
      return 'string';
    case 'integer':
    case 'number':
      return 0;
    case 'boolean':
      return false;
    default:
      if (schema.nullable) return null;
      return 'unknown';
  }
}

/**
 * Get the status code class for styling
 */
export function getStatusClass(code) {
  const c = parseInt(code, 10);
  if (c >= 200 && c < 300) return 's200';
  if (c >= 300 && c < 400) return 's200';
  if (c >= 400 && c < 500) return c === 404 ? 's404' : 's400';
  return 's500';
}
