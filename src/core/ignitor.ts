import { Client, GatewayIntentBits, Partials } from "discord.js";
import { EventManager } from "./events";
import { logger } from "../helpers/logger";
import { CommandManager } from "./commands";

export class Ignitor {
  public client: Client;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    });
  }

  /**
   * Initializes the bot
   * @returns {Promise<void>}
   */
  public async init(): Promise<void> {
    logger.info("Initializing bot...");
    new EventManager(this.client).init();
    new CommandManager(this.client).init();
    this.client.login(process.env.TOKEN);
  }
}
