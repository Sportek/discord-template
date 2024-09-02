import { BaseEvent, EventArgs } from "../core/structure/base-event";
import { Register } from "../core/structure/register";

export default class ReadyEvent extends BaseEvent {
  @Register.event("ready")
  public async execute([client]: EventArgs<"ready">): Promise<void> {
    console.log(`Bot is ready as ${client.user.tag}`);
  }
}
