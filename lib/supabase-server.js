import { createServerClient } from '@supabase/ssr';

export const createServerSupabaseClient = (context) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name) {
          return context.req?.cookies?.[name];
        },
        set(name, value, options) {
          context.res?.setHeader('Set-Cookie', `${name}=${value}; Path=/; ${options.maxAge ? `Max-Age=${options.maxAge};` : ''} HttpOnly; SameSite=Lax`);
        },
        remove(name, options) {
          context.res?.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
        },
      },
    }
  );
};
