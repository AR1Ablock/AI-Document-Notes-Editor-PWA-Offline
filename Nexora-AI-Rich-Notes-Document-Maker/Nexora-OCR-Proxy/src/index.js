export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Build target URL
    const url = new URL(request.url);
    const targetUrl = "https://api.cloud.llamaindex.ai" + url.pathname + url.search;

    // Create new headers object – preserve all original headers and add auth
    const headers = new Headers(request.headers);
    headers.set("Authorization", "Bearer api key");

    // IMPORTANT: remove host header to avoid mismatches (optional but cleaner)
    headers.delete("host");

    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.body,
      duplex: "half",   // required when forwarding a ReadableStream body
    });

    try {
      // Create a local timeout (120s) in case the upstream never responds
      const workerTimeout = AbortSignal.timeout(120_000);

      // Combine the client’s disconnect signal with the local timeout
      // If the client aborts or the timeout fires, the upstream fetch is cancelled.
      const combinedSignal = AbortSignal.any([request.signal, workerTimeout]);

      const response = await fetch(modifiedRequest, { signal: combinedSignal });

      // Add CORS headers to the response
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
      Object.entries(corsHeaders).forEach(([k, v]) => newResponse.headers.set(k, v));

      return newResponse;
    } catch (e) {
      // Distinguish between an abort and a genuine error
      if (e.name === "AbortError") {
        return new Response("Request aborted or timed out", {
          status: 408,
          headers: corsHeaders,
        });
      }
      return new Response("Proxy Error: " + e.message, {
        status: 500,
        headers: corsHeaders,
      });
    }
  }
};
