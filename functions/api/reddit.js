export async function onRequest(context) {
    const url = new URL(context.request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
        return new Response("Missing url param", { status: 400 });
    }

    // Security: Only allow reddit.com
    try {
        const u = new URL(targetUrl);
        if (!(u.hostname === 'reddit.com' || u.hostname.endsWith('.reddit.com')) && !(u.hostname === 'redd.it' || u.hostname.endsWith('.redd.it'))) {
            return new Response("Forbidden: Only reddit.com and redd.it allowed", { status: 403 });
        }
    } catch (e) {
        return new Response("Invalid URL", { status: 400 });
    }

    // Fetch from Reddit
    // Reddit aggressively blocks non-browser user agents and cloud IPs.
    const response = await fetch(targetUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip",
            "DNT": "1",
            "Upgrade-Insecure-Requests": "1"
        }
    });

    // Re-wrap response with CORS headers
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    // Preserve original content type (e.g. image/jpeg) logic handled by passing response.headers to newHeaders
    // but we must ensure we don't *overwrite* it with json unless we know it's json? 
    // Actually, simply removing the set("Content-Type") line is enough as newHeaders already has it from response.headers
    // newHeaders.set("Content-Type", "application/json");

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
}
