export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  if (url.pathname === "/api/login" || !url.pathname.startsWith("/api/")) {
    return next();
  }

  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/auth=([^;]+)/);
  if (match && match[1] === "1234") {
    return next();
  }

  return new Response(JSON.stringify({ error: "未授权" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
                                }
