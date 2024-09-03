import { ApplicationCommandDataResolvable, Client, Collection, CommandInteraction } from "discord.js";
import { logger } from "../helpers/logger";
import { resolveFiles } from "../helpers/files";
import { Register } from "./register";

export interface SuperCommand {
  command: ApplicationCommandDataResolvable;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

export class CommandManager {
  public commands: Collection<string, SuperCommand> = new Collection();
  constructor(private readonly client: Client) {}

  /**
   * Registers all commands in the src directory
   * @returns {Promise<void>}
   */
  private async readCommands(): Promise<void> {
    const files = await resolveFiles();

    for (const file of files) {
      try {
        const commandClass = await import(file).then((module) => module.default);
        if (!commandClass || !(commandClass.prototype instanceof BaseCommand)) continue;
        const metadata = Register.getMetadata(commandClass.prototype, "execute");
        if (!metadata || metadata.type !== "command") continue;
        this.commands.set(metadata.command.name, {
          command: metadata.command,
          execute: commandClass.prototype.execute,
        });
      } catch (error) {
        logger.error(`Error registering command from file ${file}`, error);
      }
    }

    logger.info(`${this.commands.size} commands registered`);
  }

  /**
   * Registers all commands
   * @returns {Promise<void>}
   */
  private async registerAllCommands(): Promise<void> {
    await this.readCommands();
    const guildId = process.env.GUILD_ID;
    const commands = this.commands.map((superCommand) => superCommand.command);
    if (guildId) {
      this.client.guilds.fetch(guildId).then((guild) => {
        guild.commands.set(commands);
      });
    } else {
      this.client.application.commands.set(commands);
    }
  }

  /**
   * Registers all commands when the bot is ready
   * @returns {Promise<void>}
   */
  private async ready(): Promise<void> {
    this.client.once("ready", async () => {
      await this.registerAllCommands();
      logger.info(`Bot is ready ${this.client.user.tag}`);
    });
  }

  /**
   * Handles interaction creation
   * @returns {Promise<void>}
   */
  private async interactionCreate(): Promise<void> {
    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isCommand()) return;
      const command = this.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        logger.error(`Error executing command ${interaction.commandName}`, error);
      }
    });
  }

  /**
   * Initializes the command manager
   * @returns {Promise<void>}
   */
  public async init(): Promise<void> {
    await this.interactionCreate();
    await this.ready();
  }
}

export abstract class BaseCommand {
  abstract execute(interaction: CommandInteraction): Promise<void>;
}
