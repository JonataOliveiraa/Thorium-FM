import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';
import { Vector2 } from '../../../../TL/Modules/Vector2.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class MoltenScale extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Shields/' + this.constructor.name;
        this._auraType = -1;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.accessory = true;
        this.Item.defense = 2;
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        ThoriumPlayer.MoltenScaleEquipped = true;

        if (this._auraType === -1) {
            this._auraType = ModProjectile.getTypeByName('accScale') ?? -2;
        }
        if (this._auraType < 0) return;

        if (player.ownedProjectileCounts[this._auraType] < 1) {
            NewProjectile(null, player.Center, Vector2.Zero, this._auraType, 1, 0, player.whoAmI, 0, 0, 0, null);
        }
    }
}
