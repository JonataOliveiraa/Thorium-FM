import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { WorldDB } from "../../../TL/WorldDB.js";
import { ThoriumPlayer } from "../../Global/ThoriumPlayer.js";

export class GrimPointer extends ModItem {
    constructor() {
        super()
        this.Texture = 'Items/Viscount/' + this.constructor.name;

        this.BatCavePointerTexture = null
        this.BloodChamberPos = null;
    }

    SetDefaults() {
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
    }

    HoldItem(item, player) {
        if (this.BatCavePointerTexture == null) {
            this.BatCavePointerTexture = tl.texture.load('Textures/Items/Viscount/BatCavePointer.png');
        }
        if (this.BloodChamberPos == null) {
            const rawPos = WorldDB.get('Thorium:BloodChamberPosXY') ?? '{ "X": 100, "Y": 100 }';
            this.BloodChamberPos = JSON.parse(rawPos);
        }

        tl.log(this.BloodChamberPos?.X)
        tl.log(this.BloodChamberPos?.Y)

        ThoriumPlayer.IsHoldingGrimPointer = true;
    }
}