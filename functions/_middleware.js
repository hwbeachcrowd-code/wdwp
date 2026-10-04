export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // 登录接口和所有非 /api/ 路径放行（静态页面）
  if (url.pathname === "/api/login" || !url.pathname.startsWith("/api/")) {
    return next();
  }

  // 下载接口单独放行（可选，若希望下载不需登录就放开这行）
  // if (url.pathname.startsWith("/api/file/")) return next();

  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/auth=([^;]+)/);
  if (match && match[1] === env.PASSWORD) {
    return next();
  }

  return new Response(JSON.stringify({ error: "未授权" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
