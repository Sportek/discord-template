import { ClientEvents, SlashCommandBuilder } from "discord.js";
import "reflect-metadata";

const metadataKey = Symbol("register");

export class Register {
  static command(target: any, command: SlashCommandBuilder) {
    Reflect.defineMetadata(metadataKey, { type: "command", command }, target);
  }

  static event(eventName: keyof ClientEvents) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      Reflect.defineMetadata(metadataKey, { type: "event", eventName, execute: descriptor.value }, target, propertyKey);
    };
  }

  static getMetadata(target: any, propertyKey: string): any {
    return Reflect.getMetadata(metadataKey, target, propertyKey);
  }
}
