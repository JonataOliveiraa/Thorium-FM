import { BardItemSound } from '../../../Common/Enum/BardItemSound.js';
import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { Empowerments } from '../../Global/Empowerments.js';
import { ArcaneArmorFabricator } from '../../Global/Tiles/ArcaneArmorFabricator.js';

let _proType = -1;

export class YewWoodLute extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentStyle = 'String';
        this.inspirationCost = 1;
    }

    SetDefaults() {
        this.SetWeaponValues(20, 4, 0);
        this.Item.width = 25;
        this.Item.height = 30;
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = BardItemSound.SuperGuitarNoise;
        this.Item.shootSpeed = 3;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('YewWoodLutePro') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    UseItem(item, player) {
        super.UseItem(item, player);

        if (player.itemAnimation === player.itemAnimationMax) {
            Empowerments.Apply(player, 'LifeRegeneration', 1);
        }

        return true;
    }

    HoldoutOffset(item, player) {
        return { X: -10, Y: 0 };
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('YewWood'), 20)
            .AddTile(ArcaneArmorFabricator.Type)
            .Register();
    }
}
