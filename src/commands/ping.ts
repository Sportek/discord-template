import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { BaseCommand } from "../core/base-command";
import { Register } from "../core/register";

export default class PingCommand extends BaseCommand {
  @Register.command({
    name: "ping",
    description: "Ping the bot",
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: "message",
        description: "Message to send",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  })
  public async execute(interaction: ChatInputCommandInteraction) {
    const message = interaction.options.getString("message");
    await interaction.reply({ content: `Pong! ${message}` });
  }
}
