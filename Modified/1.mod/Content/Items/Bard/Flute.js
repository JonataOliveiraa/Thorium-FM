import { ModBardItem } from '../../../Common/ModBardItem.js';
import { ThoriumSoundPlayer } from '../../../Common/ThoriumSoundPlayer.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { Empowerments } from '../../Global/Empowerments.js';
import { MiscHelper } from '../../Global/Utils/MiscHelper.js';

const { Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const MUZZLE_FORWARD = 40;
const MUZZLE_SIDE = 3;
const EMPOWERMENT_LEVEL = 1;

export class Flute extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.inspirationCost = 1;
        this.instrumentStyle = 'Wind';
    }

    SetDefaults() {
        this.Item.shoot = ModProjectile.getTypeByName('FlutePro');
        this.Item.shootSpeed = 6;

        this.SetWeaponValues(10, 3, 4);
        this.SetDefaultWeaponStyle(20, true);

        this.Item.width = 25;
        this.Item.height = 40;
        this.Item.scale = 0.8;
        this.Item.noMelee = true;
        this.Item.holdStyle = 3;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            ThoriumSoundPlayer.Play('fluteSound');
            Empowerments.Apply(player, 'ResourceConsumptionChance', EMPOWERMENT_LEVEL);
        }
        return true;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const norm = Vector2.Normalize(velocity);
        const side = Vector2.RotatedBy(norm, Math.PI * 0.5 * player.direction);

        const muzzle = Vector2.new(
            position.X + norm.X * MUZZLE_FORWARD - side.X * MUZZLE_SIDE,
            position.Y + norm.Y * MUZZLE_FORWARD - side.Y * MUZZLE_SIDE
        );

        const spawn = MiscHelper.CanHitLineWorld(position, muzzle) ? muzzle : position;

        NewProjectile(null, spawn, velocity, type, damage, knockBack, player.whoAmI, 0, 0, 0, null);
        return false;
    }
}
