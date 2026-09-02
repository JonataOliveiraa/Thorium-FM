import { Terraria, Microsoft, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModBuff } from '../../../TL/ModBuff.js';

const { Color } = Modules;

const BUFF_TIME = 600;

export class MidnightOil extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Consumable/' + this.constructor.name;
        this._buffType = -1;
    }

    SetStaticDefaults() {
        this.ResearchUnlockCount = 30;
        Terraria.ID.ItemID.Sets.DrinkParticleColors[this.Type] = [
            Color.new(25, 20, 35),
            Color.new(70, 60, 100),
            Color.new(115, 100, 165)
        ].makeGeneric(Microsoft.Xna.Framework.Graphics.Color);
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 17;
        this.Item.useAnimation = 17;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.DrinkLiquid;
        this.Item.useTurn = true;
        this.Item.healLife = 75;
        this.Item.consumable = true;
        this.Item.potion = true;
        this.Item.maxStack = 9999;
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 10, 0);
        this.Item.UseSound = Terraria.ID.SoundID.Item3;
    }

    UseItem(item, player) {
        if (this._buffType === -1) this._buffType = ModBuff.getTypeByName('MidnightOilBuff') ?? -2;
        if (this._buffType > 0) player.AddBuff(this._buffType, BUFF_TIME, false);
        return true;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Bone, 4)
            .AddIngredient(Terraria.ID.ItemID.LesserHealingPotion, 2)
            .AddTile(Terraria.ID.TileID.Bottles)
            .Register();
    }
}
