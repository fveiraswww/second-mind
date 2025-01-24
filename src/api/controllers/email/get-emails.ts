import { z } from 'zod';
import { logger } from '../../../utils/logger';

const searchParamsSchema = z.object({
  label: z.string().optional(),
  q: z
    .string()
    .transform((value) => parseInt(value, 10))
    .refine((value) => value >= 1 && value <= 200, {
      message: 'q must be a number between 1 and 200',
    })
    .optional(),
});

export async function getEmails(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    logger('Invalid HTTP method used. Only GET is allowed.');
    return new Response('Method not allowed', { status: 405 });
  }

  const accessToken = req.headers.get('Authorization');
  if (!accessToken) {
    logger('Authorization token is missing.');
    return new Response('Authorization token is required', { status: 401 });
  }

  const url = new URL(req.url);
  const label = url.searchParams.get('label') || 'inbox';
  const q = url.searchParams.get('q') || '5';

  const parseResult = searchParamsSchema.safeParse({ label, q });

  if (!parseResult.success) {
    logger('Invalid search parameters received.', parseResult.error.errors);
    return new Response(JSON.stringify(parseResult.error.errors), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { label: parsedLabel, q: quantity } = parseResult.data;

  try {
    logger(
      `Fetching emails from Gmail API with label: ${parsedLabel} and quantity: ${quantity}`
    );
    const messagesResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=label:${parsedLabel}&is:unread&maxResults=${quantity}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { messages } = await messagesResponse.json();

    if (!messages || messages.length === 0) {
      logger('No unread emails found.');
      return new Response('No emails found', { status: 404 });
    }

    logger(`Found ${messages.length} messages. Fetching details...`);

    const emailDetails = await Promise.all(
      messages.map(async (message: any) => {
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const emailData = await messageResponse.json();
        const headers = emailData.payload.headers;

        const subject =
          headers.find((header: any) => header.name === 'Subject')?.value ||
          'No Subject';

        let messageBody = '';
        if (emailData.payload.body?.data) {
          messageBody = Buffer.from(
            emailData.payload.body.data,
            'base64'
          ).toString('utf-8');
        } else if (emailData.payload.parts) {
          const part = emailData.payload.parts.find(
            (p: any) => p.mimeType === 'text/plain'
          );
          if (part?.body?.data) {
            messageBody = Buffer.from(part.body.data, 'base64').toString(
              'utf-8'
            );
          }
        }

        logger(`Fetched email: ${subject}`);

        return {
          id: message.id,
          threadId: message.threadId,
          subject,
          message: messageBody,
        };
      })
    );

    logger(`Successfully fetched details for ${emailDetails.length} emails.`);
    return new Response(JSON.stringify(emailDetails), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger('An error occurred while fetching emails.', error);
    return new Response('Internal server error', { status: 500 });
  }
}
