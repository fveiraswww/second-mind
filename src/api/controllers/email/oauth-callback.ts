import { z } from 'zod';
import { logger } from '../../../utils/logger';

const searchParamsSchema = z.object({
  code: z.string(),
});

export async function getGoogleAccessToken(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    logger('Invalid HTTP method. Only GET is allowed.');
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const parseResult = searchParamsSchema.safeParse(searchParams);

  if (!parseResult.success) {
    logger('Invalid request parameters.', parseResult.error.errors);
    return new Response(JSON.stringify({ error: 'Invalid code' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { code } = parseResult.data;

  try {
    logger('Exchanging authorization code for access token...');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        redirect_uri: `${process.env.URL}/api/oauth2/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenResponse.ok) {
      logger('Access token successfully retrieved.');
      return new Response(JSON.stringify(tokenData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      logger('Failed to retrieve access token.', tokenData);
      return new Response(
        JSON.stringify({
          error: 'Failed to retrieve access token',
          details: tokenData,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    logger('An unexpected error occurred.', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
