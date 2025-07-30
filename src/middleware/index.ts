import type { MiddlewareHandler } from "astro";
import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.server";

export const onRequest: MiddlewareHandler = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerInstance({
    cookies: context.cookies,
    headers: context.request.headers,
  });

  // Always try to get the user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Set user in locals if authenticated
  if (user && user.email) {
    context.locals.user = {
      id: user.id,
      email: user.email,
    };
  }

  // Set supabase instance in locals for API routes
  context.locals.supabase = supabase;

  return next();
});
