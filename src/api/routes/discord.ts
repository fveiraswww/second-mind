import { sendMessage } from '../controllers/discord/send-message';

export const discordRoutes = {
  '/api/discord/new-message': sendMessage,
};
