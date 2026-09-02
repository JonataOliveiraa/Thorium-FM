import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModMount } from '../../../TL/ModMount.js';

let _mountType = 0;

function mountType() {
    if (_mountType <= 0) _mountType = ModMount.getTypeByName('SuperAnvilMount') ?? 0;
    return _mountType;
}

export class SuperAnvil extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Donate/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 20;
        this.Item.height = 30;
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.noMelee = true;
        this.Item.value = Terraria.Item.sellPrice(0, 2, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Yellow;
        this.Item.UseSound = Terraria.ID.SoundID.Item79;
        this.Item.mountType = mountType();
    }
}
