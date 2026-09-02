import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { TotemCallerProjBase } from './TotemCallerProjBase.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

const SPRITE_WIDTH = 58;
const MUZZLE_Y = -8;
const SHOT_SPEED = 1.15;
const SHOT_KNOCKBACK = 2.5;

const DEATH_DUSTS = 15;
const DUST_CLOUD = 15;
const DUST_STONE = 1;

let _shotType = -1;

export class WindyTotemPlaced extends TotemCallerProjBase {
    get LightR() { return 0.2; }
    get LightG() { return 0.2; }
    get LightB() { return 0.3; }
    get AttackDistance() { return 160; }
    get AttackCooldown() { return 60; }

    SafeSetDefaults() {
        this.Projectile.width = SPRITE_WIDTH;
    }

    Shoot(proj, target) {
        if (_shotType === -1) _shotType = ModProjectile.getTypeByName('WindyTotemPro') ?? -2;
        if (_shotType < 0) return;

        const y = proj.Center.Y + MUZZLE_Y;

        NewProjectile(null, Vector2.new(proj.Center.X, y), Vector2.new(SHOT_SPEED, 0),
            _shotType, proj.damage, SHOT_KNOCKBACK, proj.owner, 0, 0, 0, null);
        NewProjectile(null, Vector2.new(proj.Center.X, y), Vector2.new(-SHOT_SPEED, 0),
            _shotType, proj.damage, SHOT_KNOCKBACK, proj.owner, 0, 0, 0, null);

        PlaySound(Terraria.ID.SoundID.Item24, proj.Center, 0, 1);
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < DEATH_DUSTS; i++) {
            const cloud = Main.dust[NewDust(proj.position, proj.width, proj.height, DUST_CLOUD, proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 125, Color.White, 2)];
            if (cloud) cloud.noGravity = true;

            const stone = Main.dust[NewDust(proj.position, proj.width, proj.height, DUST_STONE, proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 75, Color.White, 0.75)];
            if (stone) stone.noGravity = true;
        }
    }
}
