export const config = {
  matcher: ['/((?!_next|api/gate|gate.html|favicon.ico).*)'],
};

export default async function middleware(req) {
  const cookie = req.headers.get('cookie') || '';
  const token = cookie.match(/session=([^;]+)/)?.[1];

  if (token && (await verify(token))) {
    return; // valid session, let the request through untouched
  }

  const url = new URL('/gate.html', req.url);
  url.searchParams.set('from', new URL(req.url).pathname);
  return Response.redirect(url, 302);
}

async function verify(token) {
  const { jwtVerify } = await import('jose');
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}