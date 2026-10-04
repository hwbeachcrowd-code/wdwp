export async function onRequestPost({ request, env }) {
  const { password } = await request.json();

  if (password !== env.PASSWORD) {
    return new Response(JSON.stringify({ ok: false, error: "密码错误" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `auth=${env.PASSWORD}; Path=/; HttpOnly; SameSite=Lax`,
    },
  });
}
