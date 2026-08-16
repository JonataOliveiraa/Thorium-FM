import { Terraria, System } from './../ModImports.js';
import { CombinedLoader } from './../Loaders/CombinedLoader.js';
import { CommandLoader } from './../Loaders/CommandLoader.js';
import { EmoteBubbleLoader } from './../Loaders/EmoteBubbleLoader.js';

export class ChatHooks {
    static initialized = false;
    
    static HookList = {
        All: (info) => true,
        ProcessIncomingMessage: (info) => true,
        Commands: (info) => info.hasCommands
    };
    
    static Initialize(info) {
        if (!this.HookList.All(info) || this.initialized) return;
        
        if (this.HookList.ProcessIncomingMessage(info)) {
            Terraria.Chat.ChatCommandProcessor['void ProcessIncomingMessage(ChatMessage message, int clientId)'
            ].hook((original, self, message, client_id) => {
                const isSay = message.CommandId && message.CommandId._name === 'Say';
                if (isSay && CommandLoader.Handle(message.Text, client_id)) {
                    message.Consume();
                    return;
                }
                if (CombinedLoader.SendMessage(Terraria.Main.player[Terraria.Main.myPlayer], message.Text)) {
                    original(self, message, client_id);
                }
            });
        }
        
        if (this.HookList.Commands(info)) {
            const HelpCommand = new NativeClass('Terraria.Chat.Commands', 'HelpCommand');
            HelpCommand.ComposeMessage.hook((original, aliases) => {
                const networkText = original(aliases);
                for (const cmd of CommandLoader.Commands) {
                    networkText._text += `${CommandLoader.GetCommandUsage(cmd)}\n`;
                }
                return networkText;
            });
        }
        
        this.initialized = true;
    }
}