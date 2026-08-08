import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

const { Color, Effects } = Modules;

const DUST_GRANITE = 59;

export class GranitePickAxe extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Granite/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 40;
        this.Item.height = 40;
        this.Item.pick = 100;
        this.Item.melee = true;
        this.SetWeaponValues(11, 2, 4);
        this.Item.useTime = 13;
        this.Item.useAnimation = 18;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.useTurn = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }

    HoldItem(item, player) {
        Effects.AddLight(player.Center, 0.15, 0.35, 0.45);
    }

    UseStyle(item, player, mountOffset, heldItemFrame) {
        if (Math.random() >= 0.35) return;
        Effects.NewDust(player.Center, player.width, player.height, DUST_GRANITE, 0, 0, 0, Color.White, 1);
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('GraniteEnergyCore'), 9)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
