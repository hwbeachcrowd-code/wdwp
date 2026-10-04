import { getLatestFile } from "lanzou";

async function getFile(env, idOrAlias) {
  return await env.DB.prepare(
    "SELECT * FROM files WHERE id = ? OR alias = ?"
  ).bind(idOrAlias, idOrAlias).first();
}

// GET：实时解析直链，302 跳转（每次请求都重新解析，避免直链过期）
export async function onRequestGet({ params, env }) {
  const file = await getFile(env, params.id);
  if (!file) {
    return new Response("文件不存在", { status: 404 });
  }

  try {
    const result = await getLatestFile(file.lanzou_url, {
      pwd: file.lanzou_pwd || ""
    });

    if (!result || !result.directLink) {
      return new Response("解析失败，链接可能已失效", { status: 502 });
    }

    return Response.redirect(result.directLink, 302);
  } catch (e) {
    return new Response("解析出错：" + e.message, { status: 500 });
  }
}

// PATCH：重命名 / 修改别名（只改 D1，不动蓝奏云）
export async function onRequestPatch({ params, request, env }) {
  const file = await getFile(env, params.id);
  if (!file) {
    return new Response(JSON.stringify({ error: "文件不存在" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { name, alias } = await request.json();

  try {
    await env.DB.prepare(
      "UPDATE files SET name = ?, alias = ? WHERE id = ?"
    ).bind(name || file.name, alias || file.alias, file.id).run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "别名已存在或更新失败" }), {
      status: 409,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// DELETE：只删 D1 记录
export async function onRequestDelete({ params, env }) {
  const file = await getFile(env, params.id);
  if (!file) {
    return new Response(JSON.stringify({ error: "文件不存在" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  await env.DB.prepare("DELETE FROM files WHERE id = ?").bind(file.id).run();

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
  }
