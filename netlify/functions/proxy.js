export const handler = async (event) => {
  try {
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
      body: JSON.stringify({ error: `Proxy error: ${error.message}` }),
    };
  }
};
