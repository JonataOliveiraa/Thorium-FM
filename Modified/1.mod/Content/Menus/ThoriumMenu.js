import { Terraria } from '../../TL/ModImports.js';
import { ModMenu } from '../../TL/ModMenu.js';
import { ModSurfaceBackground } from '../../TL/ModBackgrounds.js';
import { Vector2 } from '../../TL/Modules/Vector2.js';

export class ThoriumMenu extends ModMenu {
    constructor() {
        super();
        this.Logo = 'Menus/Logo';
    }

    SetStaticDefaults() {
        const MainMenu_Layout = new NativeClass('', 'MainMenu_Layout');
        const instance = MainMenu_Layout.Instance;
        instance.CopyrightText = 'Thorium FanMade Unofficial v1.0.0';
        ['AnchorControl', 'Anchor', 'Alignment', 'Scale', 'MultiLineUseAlignment'].forEach(key => { instance.Copyright[key] = instance.VersionNumber[key]; });
        const basePos = instance.VersionNumber.Location;
        instance.Copyright.Location = Vector2.new(basePos.X, basePos.Y + 28);
    }
}