import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { Terraria } from "../../../TL/ModImports.js";

const ChatCommandProcessor = new NativeClass('Terraria.Chat', 'ChatCommandProcessor');
const NewText = Terraria.Main['void NewText(string newText, byte R, byte G, byte B)'];

export class ChatCommands extends GlobalHooks {
    constructor() {
        super();
    }

    Initialize() {

    }
}