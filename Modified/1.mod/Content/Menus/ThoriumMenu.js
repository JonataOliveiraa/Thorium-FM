import { ModBridge } from '../../Common/Snippets/ModBridge.js';
import { Terraria } from '../../TL/ModImports.js';
import { ModLocalization } from '../../TL/ModLocalization.js';
import { ModMenu } from '../../TL/ModMenu.js';
import { Color } from '../../TL/Modules/Color.js';
import { Vector2 } from '../../TL/Modules/Vector2.js';
import { gHooks } from '../Global/gHooks.js';

const GUIMainMenu = new NativeClass('', 'GUIMainMenu');
const { Main } = Terraria

export class ThoriumMenu extends ModMenu {
    constructor() {
        super();
        this.Logo = 'Menus/Logo';
    }

    SetStaticDefaults() {
        const MainMenu_Layout = new NativeClass('', 'MainMenu_Layout');
        const layout = MainMenu_Layout.Instance;
        
        if (layout.Multiplayer) {
            if (layout.Multiplayer.Label) {
                layout.Multiplayer.Label.Color = Color.Gray;
            }

            layout.Multiplayer.Color = Color.Gray;
            layout.Multiplayer.HighlightColour = Color.Gray;
            layout.Multiplayer.PressedLabelColour = Color.White;
            layout.Multiplayer.LabelHighlightTint = Color.Gray; 
        }

        const instance = layout;
        instance.CopyrightText = 'Thorium FanMade Unofficial v1.2.0';
        ['AnchorControl', 'Anchor', 'Alignment', 'Scale', 'MultiLineUseAlignment'].forEach(key => { instance.Copyright[key] = instance.VersionNumber[key]; });
        const basePos = instance.VersionNumber.Location;
        instance.Copyright.Location = Vector2.new(basePos.X, basePos.Y + 28);
    }

    Update(isOnTitleScreen) {
        if (Main.menuMultiplayer && Main.menuMode === 1) {
            Main.menuMultiplayer = false;
            Main.menuMode = 15;
            Main.statusText = ModLocalization.Translate('Others.NoMultiplayer').replace('{0}', "Thorium Fan Made");
        }

        let _warned = false;
        if (!_warned && Main.menuMode === 1) {
            
            if (!gHooks.musicPackIsActive) {
                _warned = true;
                Main.menuMode = 15;
                Main.statusText = 'Instale o Music Pack para a experiência completa.';
            }
        }
    }
}