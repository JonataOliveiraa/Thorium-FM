import { Terraria } from './../../TL/ModImports.js';
import { ModMenu } from './../../TL/ModMenu.js';
import { ModSurfaceBackground } from './../../TL/ModBackgrounds.js';

export class ExampleMenu extends ModMenu {
    constructor() {
        super();
        this.Logo = 'Menus/Logo';
        this.SunTexture = 'Menus/Sun';
        this.MoonTexture = 'Menus/Moon'
    }
    
    SetStaticDefaults() {
        this.Background = ModSurfaceBackground.getByName('ExampleBiome_SurfaceBG');
    }
}