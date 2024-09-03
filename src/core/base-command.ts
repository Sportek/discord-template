import { ApplicationCommandDataResolvable, CommandInteraction } from "discord.js";

export interface SuperCommand {
  command: ApplicationCommandDataResolvable;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

export abstract class BaseCommand {
  abstract execute(interaction: CommandInteraction): Promise<void>;
}
