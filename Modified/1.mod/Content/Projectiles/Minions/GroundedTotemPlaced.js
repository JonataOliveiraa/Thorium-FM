import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { TotemCallerProjBase } from './TotemCallerProjBase.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

const SPAWN_X = 40;
const SPAWN_Y = 16;
const SHOT_SPEED = 0.75;
const SHOT_KNOCKBACK = 8;

const DEATH_DUSTS = 15;
const DUST_DIRT = 0;
const DUST_STONE = 1;

let _shotType = -1;

export class GroundedTotemPlaced extends TotemCallerProjBase {
    get LightR() { return 0.08; }
    get LightG() { return 0.5; }
    get LightB() { return 0.08; }
    get AttackDistance() { return 100; }
    get AttackCooldown() { return 40; }

    Shoot(proj, target) {
        if (_shotType === -1) _shotType = ModProjectile.getTypeByName('GroundedTotemPro') ?? -2;
        if (_shotType < 0) return;

        const y = proj.Center.Y + SPAWN_Y;

        NewProjectile(null, Vector2.new(proj.Center.X + SPAWN_X, y), Vector2.new(SHOT_SPEED, 0),
            _shotType, proj.damage, SHOT_KNOCKBACK, proj.owner, 0, 0, 0, null);
        NewProjectile(null, Vector2.new(proj.Center.X - SPAWN_X, y), Vector2.new(-SHOT_SPEED, 0),
            _shotType, proj.damage, SHOT_KNOCKBACK, proj.owner, 0, 0, 0, null);

        PlaySound(Terraria.ID.SoundID.Item14, proj.position, 0, 1);
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < DEATH_DUSTS; i++) {
            const dirt = Main.dust[NewDust(proj.position, proj.width, proj.height, DUST_DIRT, proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 75, Color.White, 2)];
            if (dirt) dirt.noGravity = true;

            const stone = Main.dust[NewDust(proj.position, proj.width, proj.height, DUST_STONE, proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 100, Color.White, 1)];
            if (stone) stone.noGravity = true;
        }
    }
}
