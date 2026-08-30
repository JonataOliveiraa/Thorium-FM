import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

const { Color, Effects } = Modules;
const { Main } = Terraria;
const { ArmorIDs } = Terraria.ID;

export class GelatinousMask extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Vanity/' + this.constructor.name;
    }

    SetStaticDefaults() {
        ArmorIDs.Head.Sets.HidesHead[this.Item.headSlot] = true;
        ArmorIDs.Head.Sets.PreventBeardDraw[this.Item.headSlot] = true;
    }

    SetDefaults() {
        this.Item.width = 24;
        this.Item.height = 18;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = 2;
        this.Item.vanity = true;
        this.Item.maxStack = 1;
    }

    IsVanitySet(head, body, legs) {
        const mail = ModItem.getByName('GelatinousMail');
        const greaves = ModItem.getByName('GelatinousGreaves');
        if (!mail || !greaves) return false;
        return body === mail.Item.bodySlot && legs === greaves.Item.legSlot;
    }

    UpdateVanitySet(item, player) {
        if (Main.netMode === 2) return;

        const stride = player.legFrame.Y / 56;
        if (stride !== 9 && stride !== 16) return;

        for (let i = 0; i < 4; i++) {
            Effects.NewDust(player.Bottom, player.width, 0, 1, 0, -0.75, 150, Color.new(169, 255, 59), 0.8);
        }
    }

    AddRecipes() {
        const jelly = ModItem.getTypeByName('Jelly');
        if (!(jelly > 0)) return;
        this.CreateRecipe(1)
            .AddIngredient(jelly, 10)
            .AddIngredient(154, 30)
            .AddTile(16)
            .Register();
    }
}
