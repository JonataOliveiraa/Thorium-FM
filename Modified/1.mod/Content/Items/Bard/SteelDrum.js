import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Empowerments } from '../../Global/Empowerments.js';
import { ThoriumSoundPlayer } from '../../../Common/ThoriumSoundPlayer.js';

const { Vector2 } = Modules;

const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class SteelDrum extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentStyle = 'Percussion';
    }
    
    SetDefaults() {
        super.SetDefaults();
        this.Item.damage = 18;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 10;
        this.Item.useAnimation = 10;
        this.Item.noUseGraphic = false;
        this.Item.useStyle = 16;
        this.Item.holdStyle = 5;
        this.Item.noMelee = true;
        this.Item.knockBack = 4.0;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = 2;
        this.Item.shoot = ModProjectile.getTypeByName('SteelDrumPro');
        this.Item.shootSpeed = 15.0;
    }
    
    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            ThoriumSoundPlayer.Play('steelDrumSound');
            Empowerments.Apply(player, 'MovementSpeed', 1);
        }
        return true;
    }
    
    Shoot_OnSuccess(player) {
        const NewDustPerfect = Terraria.Dust.NewDustPerfect;
        const num = 40;
        for (let index = 0; index < num; index++) {
            const innerRotated = Vector2.RotatedBy(Vector2.UnitY, index * 6.2831854820251465 / num, Vector2.Zero);
            const dir = Vector2.RotatedBy(Vector2.Negate(innerRotated), Vector2.ToRotation(player.velocity), Vector2.Zero);
            const dust = NewDustPerfect(Vector2.Add(player.Center, Vector2.Multiply(dir, 15)), 88, Vector2.Multiply(dir, 6), 0, null, 1.0);
            dust.scale = 1.5;
            dust.noGravity = true;
        }
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        if (!super.Shoot(item, player, position, velocity, type, damage, knockBack)) return false;
        const source = player.GetProjectileSource_Item(item);
        let closestIndex = -1;
        let closestDistSQ = 1000000.0;
        const npcArr = Terraria.Main.npc;
        for (let index = 0; index < Terraria.Main.maxNPCs; index++) {
            const npc = npcArr[index];
            if (npc.CanBeChasedBy(null, false)) {
                const distSQ = player.DistanceSQ(npc.Center);
                if (distSQ < closestDistSQ && CanHit(player.Center, 1, 1, npc.Center, 1, 1)) {
                    closestDistSQ = distSQ;
                    closestIndex = index;
                }
            }
        }
        const speedMult = 1.0 + 1 * 0.0099999997764825821;
        if (closestIndex !== -1) {
            let dir = Vector2.Subtract(npcArr[closestIndex].Center, player.Center);
            const shootSpeed = item.shootSpeed;
            const length = dir['float Length()']();
            if (length > shootSpeed) {
                dir = Vector2.Multiply(dir, shootSpeed / length);
            }
            NewProjectile(source, position, Vector2.Multiply(dir, speedMult), type, damage, knockBack, player.whoAmI, 0.0, 0.0, 0.0, null);
            this.Shoot_OnSuccess(player);
        } else {
            NewProjectile(source, position, Vector2.Multiply(velocity, speedMult), type, damage, knockBack, player.whoAmI, 0.0, 0.0, 0.0, null);
            this.Shoot_OnSuccess(player);
        }

        return false;
    }
}
