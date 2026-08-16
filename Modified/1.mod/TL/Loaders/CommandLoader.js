import { Terraria, Modules } from './../ModImports.js';
import { CommandCaller } from './../CommandCaller.js';
import { ModLocalization } from './../ModLocalization.js';

const { Color } = Modules;

export class CommandLoader {
    static Commands = [];
    
    static NormalizeName(name) {
        return String(name ?? '').trim().replace(/^\/+/, '').toLowerCase();
    }
    
    static register(command) {
        const name = this.NormalizeName(command.Command);
        if (this.getByName(name)) {
            throw new Error(`[Command Registry Error] ${command.constructor.name}: the command or alias "/${name}" has already been registered.`);
        }
        
        const _aliases = command.Aliases;
        const aliases = Array.isArray(_aliases) ? _aliases : [];
        
        for (const alias of aliases) {
            const aliasName = this.NormalizeName(alias);
            if (!aliasName) continue;
            if (aliasName === name) {
                throw new Error(`[Command Registry Error] ${command.constructor.name}: the alias "/${aliasName}" is the same as the main name.`);
            }
            if (this.getByName(aliasName)) {
                throw new Error(`[Command Registry Error] ${command.constructor.name}: the command or alias "/${aliasName}" has already been registered.`);
            }
        }
        
        this.Commands.push(command);
    }
    
    static isModCommand(name) {
        return this.getByName(name) !== null;
    }
    
    static getByName(name) {
        const normalizedName = this.NormalizeName(name);
        return this.Commands.find(command => {
            const commandName = this.NormalizeName(command.Command);
            if (commandName === normalizedName) return true;
            const _aliases = command.Aliases;
            const aliases = Array.isArray(_aliases) ? _aliases : [];
            return aliases.some(alias => this.NormalizeName(alias) === normalizedName);
        });
    }
    
    static SetupContent() {
        for (const cmd of this.Commands) {
            cmd.SetupContent();
        }
    }
    
    static PostSetupContent() {
        for (const cmd of this.Commands) {
            cmd.PostSetupContent();
        }
    }

    static Parse(input) {
        const values = [];
        const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;
        let match;
        while ((match = regex.exec(String(input ?? ''))) !== null) {
            values.push(match[1] ?? match[2] ?? match[3]);
        }
        return values;
    }
    
    static GetCommandUsage(cmd) {
        const key = cmd.constructor.name;
        let alias = ModLocalization.TryTranslate(`ChatCommand.${key}`);
        if (!alias) alias = cmd.Command;
        const description = ModLocalization.TryTranslate(`ChatCommandDescription.${key}`);
        return `${alias} ${description}`;
    }
    
    static Reply(text, color = Color.White) {
        Terraria.Main['void NewText(string newText, Color color)'
        ](String(text), color ?? Color.White);
    }
    
    static Handle(input, clientId) {
        const originalInput = String(input ?? '').trim();
        const parts = this.Parse(originalInput);
        if (parts.length === 0 || !parts[0].startsWith('/')) {
            return false;
        }
        
        const commandName = this.NormalizeName(parts.shift());
        const command = this.getByName(commandName);
        if (!command) return false;
        
        const player = (clientId >= 0 && clientId < Terraria.Main.maxPlayers) ? Terraria.Main.player[clientId] : Terraria.Main.LocalPlayer;
        const caller = new CommandCaller(player, clientId, command);
        
        if (command.Action(caller, originalInput, parts) === false) {
            caller.Reply(CommandLoader.GetCommandUsage(command), Color.new(255, 240, 20));
        }
        
        return true;
    }
}