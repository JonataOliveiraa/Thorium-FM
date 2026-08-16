import { CommandLoader } from './Loaders/CommandLoader.js';

export class CommandCaller {
    constructor(player, clientId, command) {
        this.Player = player;
        this.ClientId = clientId;
        this.Command = command;
    }
    
    Reply(text, color = Color.White) {
        CommandLoader.Reply(text, color);
    }
}