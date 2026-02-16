export const handler = async (event) => {
  try {
    // Some internal/staging services expose non-public or self-signed cert chains.
    // Enable only when explicitly set in Netlify env vars.
    if (process.env.ALLOW_INSECURE_TLS === 'true') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers':
            'Content-Type, Authorization, x-lang, x-application, x-client-name, x-device-id, x-device-type, x-client-version, x-device-model, x-os-version, x-build-version, x-build-no, x-is-mock',
        },
      };
    }

    const targetUrl = event.queryStringParameters?.url;

    if (!targetUrl) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Missing "url" query parameter' }),
      };
    }

    const incomingHeaders = { ...(event.headers || {}) };
    delete incomingHeaders.host;
    delete incomingHeaders.Host;
    delete incomingHeaders['content-length'];
    delete incomingHeaders['Content-Length'];

    const response = await fetch(targetUrl, {
      method: event.httpMethod || 'GET',
      headers: incomingHeaders,
      signal: AbortSignal.timeout(20000),
      body:
        event.httpMethod === 'GET' || event.httpMethod === 'HEAD'
          ? undefined
          : event.body,
    });

    const responseText = await response.text();
    const responseHeaders = Object.fromEntries(response.headers.entries());
    responseHeaders['Access-Control-Allow-Origin'] = '*';
    responseHeaders['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
    responseHeaders['Access-Control-Allow-Headers'] =
      'Content-Type, Authorization, x-lang, x-application, x-client-name, x-device-id, x-device-type, x-client-version, x-device-model, x-os-version, x-build-version, x-build-no, x-is-mock';

    return {
      statusCode: response.status,
      headers: responseHeaders,
      body: responseText,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: `Proxy error: ${error.message}`,
        code: error.code || null,
        cause: error.cause?.message || null,
      }),
    };
  }
};
