import { getEmails } from '../controllers/email/get-emails';
import { getGoogleAccessToken } from '../controllers/email/oauth-callback';
import { summarizeEmailsToDiscord } from '../controllers/email/summarize-emails-to-discord';

export const emailRoutes = {
  '/api/email/get-email': getEmails,
  '/api/email/send-summarized-email': summarizeEmailsToDiscord,
  '/api/oauth2/callback': getGoogleAccessToken,
};
