import { getLatestFile } from "lanzou";

// GET：列出所有文件
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT id, name, alias, size, type, created_at FROM files ORDER BY created_at DESC"
  ).all();

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
}

// POST：接收蓝奏云链接，解析后存入 D1
export async function onRequestPost({ request, env }) {
  const { lanzouUrl, lanzouPwd } = await request.json();

  if (!lanzouUrl) {
    return new Response(JSON.stringify({ error: "缺少蓝奏云链接" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 解析蓝奏云链接，拿到文件名、大小
  let parsed;
  try {
    parsed = await getLatestFile(lanzouUrl, { pwd: lanzouPwd || "" });
  } catch (e) {
    return new Response(JSON.stringify({ error: "解析失败：" + e.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!parsed || !parsed.name) {
    return new Response(JSON.stringify({ error: "无法从链接中提取文件信息" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const id = crypto.randomUUID().slice(0, 8);
  const alias = id;

  try {
    await env.DB.prepare(
      "INSERT INTO files (id, name, alias, size, type, lanzou_url, lanzou_pwd, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      id, parsed.name, alias, parsed.size || 0, parsed.type || "",
      lanzouUrl, lanzouPwd || "", Date.now()
    ).run();

    return new Response(JSON.stringify({
      ok: true, id, alias, name: parsed.name, size: parsed.size || 0
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "数据库写入失败：" + e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
    }
