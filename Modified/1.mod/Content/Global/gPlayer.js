import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModPlayer } from './../../TL/ModPlayer.js';
import { ModBuff } from './../../TL/ModBuff.js';
import { ModLocalization } from './../../TL/ModLocalization.js';
import { GlobalHooks } from './../../TL/GlobalHooks.js';
import { Subworld } from './../../TL/Subworld.js';
import { ModAchievement } from './../../TL/ModAchievement.js';

const NewText = Terraria.Main['void NewText(string newText, byte R, byte G, byte B)'];

export class gPlayer extends ModPlayer {
  constructor() {
    super();
  }
  OnEnterWorld(player) {
    NewText(ModLocalization.Translate('CustomText.WelcomeMessage').replace('{WorldName}', GlobalHooks.getByName('gHooks').worldName), 255, 200, 0);
  }

  ResetEffects(player) {
  }

  UpdateEquips(player) {
  }

  SendMessage(player, msg) {
  }
}