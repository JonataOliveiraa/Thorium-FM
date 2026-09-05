import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Empowerments } from '../../Global/Empowerments.js';
import { ThoriumSoundPlayer } from '../../../Common/ThoriumSoundPlayer.js';

const { Color, Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class GrandPiano extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentStyle = 'String';
    }
    
    SetStaticDefaults() {
        this.ColorBlack = Color.new(0, 0, 0, 255);
    }

    SetDefaults() {
        super.SetDefaults();
        this.Item.damage = 13;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 10;
        this.Item.useAnimation = 10;
        this.Item.useStyle = 5;
        this.Item.holdStyle = 3;
        this.Item.noMelee = true;
        this.Item.knockBack = 2.0;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 10, 0);
        this.Item.rare = 1;
        this.Item.shoot = ModProjectile.getTypeByName('GrandPianoPro');
        this.Item.shootSpeed = 8.0;
    }

    HoldoutOffset(item) {
        return { X: -4, Y: 7 };
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            ThoriumSoundPlayer.Play('pianoSound');
            Empowerments.Apply(player, 'Defense', 1);
            this.OnPlayInstrument(player);
        }
        return true;
    }

    OnPlayInstrument(player) {
        const num = 40;
        for (let index = 0; index < num; index++) {
            const innerRotated = Vector2.RotatedBy(Vector2.UnitY, index * 6.2831854820251465 / num, Vector2.Zero);
            const dir = Vector2.RotatedBy(Vector2.Negate(innerRotated), Vector2.ToRotation(player.velocity), Vector2.Zero);
            const dust = Terraria.Dust.NewDustPerfect(Vector2.Add(player.Center, Vector2.Multiply(dir, 15)), 4, Vector2.Multiply(dir, 6), 0, this.ColorBlack, 1.0);
            dust.scale = 1.25;
            dust.noGravity = true;
        }
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        player.direction = velocity.X > 0 ? 1 : -1;

        const source = player.GetProjectileSource_Item(item);
        let closestIndex = -1;
        let closestDistSQ = 1000000.0;
        const distSQTo = player.DistanceSQ;
        const canHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
        for (let index = 0; index < Terraria.Main.maxNPCs; index++) {
            const npc = Terraria.Main.npc[index];
            if (npc.CanBeChasedBy(null, false)) {
                const distSQ = distSQTo(npc.Center);
                if (distSQ < closestDistSQ && canHit(player.Center, 1, 1, npc.Center, 1, 1)) {
                    closestDistSQ = distSQ;
                    closestIndex = index;
                }
            }
        }
        if (closestIndex !== -1) {
            let dir = Vector2.Subtract(Terraria.Main.npc[closestIndex].Center, player.Center);
            const shootSpeed = item.shootSpeed;
            const length = dir['float Length()']();
            if (length > shootSpeed) {
                dir = Vector2.Multiply(dir, shootSpeed / length);
            }
            NewProjectile(source, position, dir, type, damage, knockBack, player.whoAmI, 0.0, 0.0, 0.0, null);
        } else {
            NewProjectile(source, position, velocity, type, damage, knockBack, player.whoAmI, 0.0, 0.0, 0.0, null);
        }
        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
        .AddIngredient(ModItem.getTypeByName('SmoothCoal'), 10)
        .AddIngredient(21, 8)
        .AddTile(16)
        .Register();
        
        this.CreateRecipe(1)
        .AddIngredient(ModItem.getTypeByName('SmoothCoal'), 10)
        .AddIngredient(705, 8)
        .AddTile(16)
        .Register();
    }
}
