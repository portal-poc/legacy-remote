/**
 * PoC stand-in for the legacy app's BFF. It shows the auth model for apps that keep their own identity provider:
 * the browser sends the PORTAL token (issued by the host's login for this BFF's audience — no second login in the
 * host); the BFF validates it and exchanges it on-behalf-of for the legacy auth's token, server-side. The legacy
 * system never sees a browser login, the host never sees the legacy auth.
 */
const LEGACY_SCOPE = 'api://legacy-bff/Legacy.Read';

type PortalClaims = { sub: string; name: string; scp: readonly string[]; exp: number };

export type LegacyProfile = {
  portalUser: string;
  legacyAccount: string;
  exchange: { audience: string; legacyToken: string; expiresAt: string };
};

const readPortalToken = (authorization: string | null): PortalClaims | null => {
  const token = authorization?.replace(/^Bearer /, '');
  if (!token?.startsWith('mock.')) {
    return null;
  }
  try {
    return JSON.parse(atob(token.slice(5).replaceAll('-', '+').replaceAll('_', '/'))) as PortalClaims;
  } catch {
    return null;
  }
};

/** The "legacy auth" side of the on-behalf-of exchange: one legacy session per portal user, cached by the BFF. */
const legacySessions = new Map<string, { legacyToken: string; expiresAt: string }>();

const exchangeOnBehalfOf = (claims: PortalClaims) => {
  const cached = legacySessions.get(claims.sub);
  if (cached && Date.parse(cached.expiresAt) > Date.now()) {
    return cached;
  }
  const session = {
    legacyToken: `legacy.${claims.sub}.${Math.random().toString(36).slice(2, 10)}`,
    expiresAt: new Date(Math.min(claims.exp * 1000, Date.now() + 15 * 60 * 1000)).toISOString(),
  };
  legacySessions.set(claims.sub, session);
  return session;
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const fakeLegacyBffFetch = async (url: string, init: RequestInit): Promise<Response> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const claims = readPortalToken(new Headers(init.headers).get('authorization'));
  if (!claims || claims.exp * 1000 < Date.now()) {
    return json({ error: 'invalid_token' }, 401);
  }
  if (!claims.scp.includes(LEGACY_SCOPE)) {
    return json({ error: 'insufficient_scope', required: LEGACY_SCOPE }, 403);
  }
  if (!new URL(url).pathname.endsWith('/profile')) {
    return json({ error: 'not found' }, 404);
  }
  const session = exchangeOnBehalfOf(claims);
  const profile: LegacyProfile = {
    portalUser: claims.name,
    legacyAccount: `L-${claims.sub.toUpperCase()}`,
    exchange: { audience: LEGACY_SCOPE, ...session },
  };
  return json(profile);
};

export { LEGACY_SCOPE };
