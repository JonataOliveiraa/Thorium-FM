import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { Empowerments } from '../../Global/Empowerments.js';

export class Tambourine extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.useWheel = false;
        this.instrumentStyle = 'Percussion'
    }

    SetDefaults() {
        this.Item.width = 32;
        this.Item.height = 32;

        this.Item.value = Terraria.Item.sellPrice(0, 0, 1, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        this.Item.maxStack = 1

        this.SetWeaponValues(15, 8, 10);
        this.SetDefaultWeaponStyle(25, false);

        this.Item.useAnimation = 10;
        this.Item.useTime = 10;
        this.Item.autoReuse = true;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noUseGraphic = true;

        this.Item.shoot = ModProjectile.getTypeByName("TambourinePro");
        this.Item.shootSpeed = 10;
    }

    CanUseItem(item, player) {
        return player.ownedProjectileCounts[this.Item.shoot] < 1;
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            Empowerments.Apply(player, "MovementSpeed", 1);
        }
        return true;
    }
}