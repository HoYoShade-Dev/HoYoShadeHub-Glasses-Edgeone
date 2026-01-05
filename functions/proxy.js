/**
 * This is the final, correct version of the proxy function.
 * It leverages a professional third-party proxy to handle anti-bot measures.
 */

// Client-side injection script for URL rewriting
const clientInjectionScript = `
<script>
(function() {
    // Get proxy information
    const proxyUrl = new URL(window.location.href);
    const searchParams = new URLSearchParams(proxyUrl.search);
    const originalUrlStr = searchParams.get('url');
    
    if (!originalUrlStr) return;
    
    const proxyHost = proxyUrl.host;
    const proxyProtocol = proxyUrl.protocol;
    const proxyPath = proxyUrl.pathname;
    
    // Function to convert relative/absolute URLs to proxied format
    function changeURL(url) {
        if (!url) return url;
        
        let urlStr = url.toString();
        
        // Skip special protocols
        if (urlStr.startsWith('data:') || urlStr.startsWith('mailto:') || 
            urlStr.startsWith('javascript:') || urlStr.startsWith('about:') ||
            urlStr.startsWith('chrome:') || urlStr.startsWith('edge:')) {
            return urlStr;
        }

        // Handle blob: URLs
        let pathAfterAdd = "";
        if (urlStr.startsWith("blob:")) {
            pathAfterAdd = "blob:";
            urlStr = urlStr.substring("blob:".length);
        }
        
        // Skip already proxied URLs
        if (urlStr.includes('/proxy?url=')) {
            return urlStr;
        }
        
        try {
            // Resolve to absolute URL
            const absoluteUrl = new URL(urlStr, originalUrlStr).href;
            // Add proxy prefix
            return pathAfterAdd + proxyPath + '?url=' + encodeURIComponent(absoluteUrl);
        } catch (e) {
            // console.warn('URL conversion error:', e, urlStr);
            return pathAfterAdd + urlStr;
        }
    }

    // Helper to get original URL from a proxied one (for getters)
    function getOriginalUrl(url) {
        if (!url) return url;
        const str = url.toString();
        // Try to extract url param
        try {
            if (str.includes('/proxy?url=')) {
                const u = new URL(str);
                const p = u.searchParams.get('url');
                if (p) return p;
            }
        } catch(e) {}
        return str;
    }
    
    // Hook fetch API
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
        let url;
        if (typeof input === 'string') {
            url = input;
        } else if (input instanceof Request) {
            url = input.url;
        } else {
            url = input;
        }
        
        url = changeURL(url);
        
        if (typeof input === 'string') {
            return originalFetch(url, init);
        } else {
            const newRequest = new Request(url, input);
            return originalFetch(newRequest, init);
        }
    };
    
    // Hook XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        url = changeURL(url);
        return originalOpen.apply(this, arguments);
    };
    
    // Hook window.open
    const originalWindowOpen = window.open;
    window.open = function(url, name, specs) {
        return originalWindowOpen.call(window, changeURL(url), name, specs);
    };
    
    // Hook appendChild
    const originalAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function(child) {
        try {
            if (child.src) child.src = changeURL(child.src);
            if (child.href) child.href = changeURL(child.href);
        } catch(e) {}
        return originalAppendChild.call(this, child);
    };

    // --- Property Descriptor Hooks ---
    const elementPrototypes = [
        [HTMLAnchorElement, "href"],
        [HTMLScriptElement, "src"],
        [HTMLImageElement, "src"],
        [HTMLLinkElement, "href"],
        [HTMLIFrameElement, "src"],
        [HTMLVideoElement, "src"],
        [HTMLAudioElement, "src"],
        [HTMLSourceElement, "src"],
        [HTMLObjectElement, "data"],
        [HTMLFormElement, "action"],
        [HTMLAreaElement, "href"],
        [HTMLBaseElement, "href"],
        [HTMLInputElement, "src"],
    ];

    for (const [elementClass, property] of elementPrototypes) {
        if (!elementClass || !elementClass.prototype) continue;
        
        const descriptor = Object.getOwnPropertyDescriptor(elementClass.prototype, property);
        if (!descriptor) continue;

        Object.defineProperty(elementClass.prototype, property, {
            get: function() {
                const real = descriptor.get.call(this);
                return getOriginalUrl(real);
            },
            set: function(value) {
                descriptor.set.call(this, changeURL(value));
            },
            configurable: true,
            enumerable: true
        });
    }

    // Hook setAttribute/getAttribute
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
        if ((name === 'src' || name === 'href' || name === 'action' || name === 'data') && typeof value === 'string') {
            value = changeURL(value);
        }
        return originalSetAttribute.call(this, name, value);
    };

    const originalGetAttribute = Element.prototype.getAttribute;
    Element.prototype.getAttribute = function(name) {
        const value = originalGetAttribute.call(this, name);
        if (name === 'src' || name === 'href' || name === 'action' || name === 'data') {
            return getOriginalUrl(value);
        }
        return value;
    };
    
    // MutationObserver
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    if (node.hasAttribute('src')) node.setAttribute('src', node.getAttribute('src'));
                    if (node.hasAttribute('href')) node.setAttribute('href', node.getAttribute('href'));
                    
                    node.querySelectorAll && node.querySelectorAll('[href], [src]').forEach(el => {
                        if (el.hasAttribute('src')) el.setAttribute('src', el.getAttribute('src'));
                        if (el.hasAttribute('href')) el.setAttribute('href', el.getAttribute('href'));
                    });
                }
            });
        });
    });
    
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
    
    console.log('Proxy client hooks installed (query mode enhanced)');
})();
</script>
`;

export async function onRequest(context) {
    const { request } = context;

    try {
        const requestUrl = new URL(request.url);
        let targetUrlParam = requestUrl.searchParams.get('url');

        if (!targetUrlParam) {
            return new Response("Query parameter 'url' is missing.", { status: 400 });
        }

        // Fix: Ensure target URL has a protocol
        if (!targetUrlParam.startsWith('http://') && !targetUrlParam.startsWith('https://')) {
            targetUrlParam = 'https://' + targetUrlParam;
        }

        // **CRITICAL FIX: Use a professional proxy service.**
        //const proxyServiceUrl = 'https://cors-anywhere.herokuapp.com/';
        const proxyServiceUrl = '';
        const actualUrlStr = proxyServiceUrl + targetUrlParam;

        // We can now use a much simpler request, as the proxy service will handle headers.
        const modifiedRequest = new Request(actualUrlStr, {
            headers: {
                //'Origin': requestUrl.origin, // The proxy service requires an Origin header.
                //'X-Requested-With': 'XMLHttpRequest',
                'Accept': '*/*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
            },
            method: request.method,
            body: (request.method === 'POST' || request.method === 'PUT') ? request.body : null,
            redirect: 'follow' // We can let the proxy service handle redirects.
        });

        const response = await fetch(modifiedRequest);

        // We still need to filter Set-Cookie to avoid browser security issues.
        const finalHeaders = new Headers(response.headers);
        finalHeaders.delete('Set-Cookie');
        finalHeaders.delete('Content-Security-Policy');
        finalHeaders.delete('Content-Security-Policy-Report-Only');
        finalHeaders.delete('X-Frame-Options');

        const contentType = finalHeaders.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            let text = await response.text();

            // Remove integrity attributes to prevent subresource integrity checks from failing
            text = text.replace(/\sintegrity\s*=\s*["'][^"']*["']/gi, '');

            // Remove CSP meta tags
            text = text.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '');

            // Inject client-side script before </head> or at the beginning of <body>
            if (text.includes('</head>')) {
                text = text.replace('</head>', clientInjectionScript + '</head>');
            } else if (text.includes('<body')) {
                text = text.replace(/<body([^>]*)>/, '<body$1>' + clientInjectionScript);
            } else {
                // If no head or body tag, prepend to HTML
                text = clientInjectionScript + text;
            }

            return new Response(text, {
                status: response.status,
                statusText: response.statusText,
                headers: finalHeaders
            });
        }

        // For non-HTML content, return the stream directly
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: finalHeaders
        });

    } catch (error) {
        return new Response(`Proxy Error: ${error.message}`, { status: 500 });
    }
}
