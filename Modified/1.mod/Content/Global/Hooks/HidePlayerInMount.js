import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModMount } from "../../../TL/ModMount.js";

const { Main } = Terraria;

export class HidePlayerInMount extends GlobalHooks {
    constructor() {
        super();
    }

    Initialize() {
        Terraria.DataStructures.PlayerDrawSet.CreateCompositeData.hook((original, self) => {
            const player = self.drawPlayer; 

            if (player.mount.Type === ModMount.getTypeByName('MagmaCharm')) {
                self.hideEntirePlayer = true;
            }

            original(self);
        });
    }
}