import { CommandLoader } from './Loaders/CommandLoader.js';
import { ModLocalization } from './ModLocalization.js';
import { Color } from './Modules/Color.js';

export class ModCommand {
    static get ResponseColor() {
        return Color.new(255, 240, 20);
    }
    
    constructor() {}
    
    get Command() {
        return '';
    }
    
    get Aliases() {
        return [];
    }
    
    SetupContent() {
        
    }
    
    PostSetupContent() {
        
    }
    
    // see 'TL/CommandCaller.js'
    Action(commandCaller, input, args) {
        return false;
    }
    
    static isModCommand(name) {
        return CommandLoader.isModCommand(name);
    }
    static getByName(name) {
        return CommandLoader.getByName(name);
    }
    static register(command) {
        CommandLoader.register(new command());
    }
}