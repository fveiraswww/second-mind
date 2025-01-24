import { getEmails } from './get-emails';
import { sendMessage } from '../discord/send-message';
import { z } from 'zod';
import { logger } from '../../../utils/logger';

const requestSchema = z.object({
  label: z.string().optional(),
  q: z
    .string()
    .transform((value) => parseInt(value, 10))
    .refine((value) => value >= 1 && value <= 200, {
      message: 'q must be a number between 1 and 200',
    })
    .optional(),
  webhookUrl: z.string().url(),
});

export async function summarizeEmailsToDiscord(
  req: Request
): Promise<Response> {
  if (req.method !== 'POST') {
    logger('Invalid HTTP method. Only POST is allowed.');
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const parseResult = requestSchema.safeParse(body);

    if (!parseResult.success) {
      logger('Invalid request body.', parseResult.error.errors);
      return new Response(JSON.stringify(parseResult.error.errors), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { label = 'inbox', q = 5, webhookUrl } = parseResult.data;
    const accessToken = req.headers.get('Authorization');

    if (!accessToken) {
      logger('Authorization token is missing.');
      return new Response('Authorization token is required', { status: 401 });
    }

    logger(`Fetching emails from label: ${label}, quantity: ${q}`);
    const emailsResponse = await getEmails(
      new Request(
        `${process.env.URL}/api/email/get-email?label=${label}&q=${q}`,
        {
          headers: { Authorization: accessToken },
        }
      )
    );

    if (!emailsResponse.ok) {
      const errorText = await emailsResponse.text();
      logger(`Failed to fetch emails: ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Failed to fetch emails: ${errorText}` }),
        {
          status: emailsResponse.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const emails = await emailsResponse.json();
    logger(`Fetched ${emails.length} emails. Generating summaries...`);

    const summaries = await Promise.all(
      emails.map(async (email: any) => {
        const openAIResponse = await fetch(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content:
                    'Summarize the following email content concisely. 2 sentences max.',
                },
                { role: 'user', content: email.message },
              ],
            }),
          }
        );

        if (!openAIResponse.ok) {
          const errorText = await openAIResponse.text();
          logger(
            `Failed to summarize email with subject: ${email.subject}. Error: ${errorText}`
          );
          throw new Error(`Failed to summarize email: ${errorText}`);
        }

        const responseData = await openAIResponse.json();
        const summary =
          responseData.choices[0]?.message?.content || 'No summary available.';

        logger(`Generated summary for email: ${email.subject}`);
        return {
          subject: email.subject,
          summary,
        };
      })
    );

    logger(`Summaries generated. Sending to Discord...`);

    for (const [index, summary] of summaries.entries()) {
      const message = `\n\n${index + 1}. **${summary.subject}**\n${summary.summary}\n\n\n`;

      const discordResponse = await sendMessage(
        new Request(`${process.env.URL}/api/discord/new-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            webhookUrl,
            message,
          }),
        })
      );

      if (!discordResponse.ok) {
        const errorText = await discordResponse.text();
        logger(`Failed to send summary to Discord. Error: ${errorText}`);
        return new Response(
          JSON.stringify({ error: `Failed to send to Discord: ${errorText}` }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      logger(`Summary for email ${index + 1} sent to Discord successfully.`);
    }

    logger('All email summaries sent to Discord.');
    return new Response(
      JSON.stringify({
        status: 'Email summaries sent to Discord successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger('Unexpected error in summarizeEmailsToDiscord.', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
