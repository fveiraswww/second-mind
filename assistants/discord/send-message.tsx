import { z } from 'zod';

const sendMessageSchema = z.object({
  webhookUrl: z.string(),
  message: z.string(),
});

export async function sendMessage(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const parsedBody = sendMessageSchema.safeParse(body);

    if (!parsedBody.success) {
      return new Response(JSON.stringify({ error: parsedBody.error.errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { webhookUrl, message } = parsedBody.data;

    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
      }),
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      return new Response(
        JSON.stringify({ error: `Failed to send message: ${errorText}` }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ status: 'Message sent successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response('Internal server error', { status: 500 });
  }
}
