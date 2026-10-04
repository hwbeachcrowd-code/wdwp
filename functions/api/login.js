export async function onRequestPost({ request }) {
  const { password } = await request.json();

  if (password !== "1234") {
    return new Response(JSON.stringify({ ok: false, error: "密码错误" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "auth=1234; Path=/; HttpOnly; SameSite=Lax",
    },
  });
      }
