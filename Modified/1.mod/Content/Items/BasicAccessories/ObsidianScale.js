import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const { Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class ObsidianScale extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/' + this.constructor.name;
        this._auraType = -1;
    }

    SetDefaults() {
        this.Item.width = this.Item.height = 20;
        this.Item.accessory = true;
        this.Item.rare = 3;
        this.Item.value = Terraria.Item.sellPrice(0,2,0,0);
        this.Item.defense = 2;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;
        player.fireWalk = true;
        ThoriumPlayer.accReducedKnockback = true;
        ThoriumPlayer.ObsidianScaleEquipped = true;

        if (this._auraType === -1) {
            this._auraType = ModProjectile.getTypeByName('accScale') ?? -2;
        }
        if (this._auraType < 0) return;

        if (player.ownedProjectileCounts[this._auraType] < 1) {
            NewProjectile(null, player.Center, Vector2.Zero, this._auraType, 1, 0, player.whoAmI, 0, 0, 0, null);
        }
    }
    
    AddRecipes() {
        this.CreateRecipe()
        .AddIngredient(ModItem.getTypeByName('BlacksmithsBarrierShield'))
        .AddIngredient(193)
        .AddIngredient(ModItem.getTypeByName('MoltenScale'))
        .AddTile(114)
        .Register();
    }
}