import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;

  if (user) {
    return new Response(JSON.stringify({ user }), { status: 200 });
  }

  return new Response(JSON.stringify({ user: null }), { status: 200 });
};
