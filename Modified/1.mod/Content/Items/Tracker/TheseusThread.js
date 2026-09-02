import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const TELEPORT = 'void Teleport(Vector2 newPos, int Style, int extraInfo)';
const TELEPORT_STYLE = 1;

export class TheseusThread extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Tracker/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 24;
        this.Item.height = 24;
        this.Item.mana = 50;
        this.Item.value = Terraria.Item.sellPrice(0, 2, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item6;
        this.Item.useTime = 60;
        this.Item.useAnimation = 60;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.HoldUp;
    }

    CanUseItem(item, player) {
        return Main.dungeonX > 0 && Main.dungeonY > 0;
    }

    UseItem(item, player) {
        if (player.whoAmI !== Main.myPlayer) return true;

        const target = Vector2.new(
            Main.dungeonX * 16 + 8,
            Main.dungeonY * 16 - player.height / 2
        );

        player[TELEPORT](target, TELEPORT_STYLE, 0);
        return true;
    }
}
