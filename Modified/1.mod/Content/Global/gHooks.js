import { ReLogic, Terraria } from './../../TL/ModImports.js';
import { GlobalHooks } from './../../TL/GlobalHooks.js';
import { ModBridge } from '../../Common/Snippets/ModBridge.js';
import { ItemLoader } from '../../TL/Loaders/ItemLoader.js';
import { ModBardItem } from '../../Common/ModBardItem.js';
import { ThoriumPlayer } from './ThoriumPlayer.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ThoriumSoundPlayer } from '../../Common/ThoriumSoundPlayer.js';

const { Main, GameContent, Initializers } = Terraria
const { AssetRequestMode } = ReLogic.Content

export class gHooks extends GlobalHooks {
    static musicPackIsActive;

    constructor() {
        super();
    }

    Initialize() {
        Terraria.Main['void PostContentLoadInitialize()'].hook((original, self) => {
            original(self);
            gHooks.musicPackIsActive = ModBridge.isActive('potato-music-pack');
            ThoriumSoundPlayer.Initialize();
            
            tl.log(`[gHooks] Music pack is active: ${gHooks.musicPackIsActive ? 'Yes' : 'No'}`);
        });


        Initializers.AssetInitializer.LoadSplashAssets.hook((original, asyncLoadForSounds) => {
            original(asyncLoadForSounds)
            const num = Math.floor(Math.random() * 10) + 1;

            const map = {
                1: 4,
                2: 1,
                3: 5,
                4: 2,
                5: 7,
                6: 3,
                7: 8,
                8: 0,
                9: 9,
                10: 6
            };

            GameContent.TextureAssets.SplashTextureLegoBack.Value =
                tl.texture.load(`Textures/Splash/Splash_${num}_0.png`);

            GameContent.TextureAssets.SplashTextureLegoTree.Value =
                tl.texture.load(`Textures/Splash/Splash_${num}_1.png`);

            GameContent.TextureAssets.SplashTextureLegoFront.Value =
                tl.texture.load(`Textures/Splash/${map[num]}.png`);

            GameContent.TextureAssets.Item[75].Value =
                tl.texture.load("Textures/Splash/Item_75.png");

            GameContent.TextureAssets.LoadingSunflower.Value =
                tl.texture.load("Textures/Splash/Sunflower_Loading.png");
        });
    }
}