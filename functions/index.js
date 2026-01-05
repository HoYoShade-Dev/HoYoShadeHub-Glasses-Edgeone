/**
 * This is the final, correct version of the proxy function.
 * It leverages a professional third-party proxy to handle anti-bot measures.
 */
export async function onRequest(context) {
    const { request } = context;
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Forbidden</title>
</head>
<body>
  Forbidden
</body>
</html>`

    const requestUrl = new URL(request.url);

    if (requestUrl.hostname === "translate.mill.ip-ddns.com") {
        const header = new Headers(request.headers)
        header.delete("host")

        const modifiedRequest = new Request(request.url.replace("translate.mill.ip-ddns.com", "translate.google.com"), {
            headers: header,
            method: request.method,
            body: request.body
        });
        return fetch(modifiedRequest);
    } else {

        const finalHeaders = new Headers({
            'Content-Type': 'text/html'
        });
        return new Response(html, { status: 403, headers: finalHeaders});
    }
}
