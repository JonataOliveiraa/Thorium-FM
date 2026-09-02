import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { TotemCallerProjBase } from './TotemCallerProjBase.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

const MUZZLE_Y = 10;
const SHOT_UP = -4.75;
const SHOT_SPREAD = [1.5, 0.85, 0, -0.85, -1.5];
const SHOT_KNOCKBACK = 1;

const DEATH_DUSTS = 15;
const DUST_WATER = 29;
const DUST_MIST = 132;

let _shotType = -1;

export class MistyTotemPlaced extends TotemCallerProjBase {
    get LightR() { return 0.2; }
    get LightG() { return 0.2; }
    get LightB() { return 0.5; }
    get AttackDistance() { return 225; }
    get AttackCooldown() { return 90; }

    Shoot(proj, target) {
        if (_shotType === -1) _shotType = ModProjectile.getTypeByName('MistyTotemPro') ?? -2;
        if (_shotType < 0) return;

        const y = proj.position.Y + MUZZLE_Y;

        for (const vx of SHOT_SPREAD) {
            NewProjectile(null, Vector2.new(proj.Center.X, y), Vector2.new(vx, SHOT_UP),
                _shotType, proj.damage, SHOT_KNOCKBACK, proj.owner, 0, 0, 0, null);
        }

        PlaySound(Terraria.ID.SoundID.NPCDeath9, proj.Center, 0, 1);
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < DEATH_DUSTS; i++) {
            const water = Main.dust[NewDust(proj.position, proj.width, proj.height, DUST_WATER, proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 75, Color.White, 2)];
            if (water) water.noGravity = true;

            const mist = Main.dust[NewDust(proj.position, proj.width, proj.height, DUST_MIST, proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 75, Color.White, 0.75)];
            if (mist) mist.noGravity = true;
        }
    }
}
