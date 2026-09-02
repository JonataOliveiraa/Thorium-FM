import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { TotemCallerProjBase } from './TotemCallerProjBase.js';
import { MiscHelper } from './../../Global/Utils/MiscHelper.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

const MUZZLE_Y = 10;
const SHOT_SPEED = 6.5;
const SHOT_GRAVITY = 0.2;
const SHOT_NO_GRAVITY_TICKS = 19;
const SHOT_OFFSET_CAP = 2.1;
const SHOT_KNOCKBACK = 3;

const DEATH_DUSTS = 15;
const DUST_FIRE = 6;
const DUST_EMBER = 127;

let _shotType = -1;

export class FieryTotemPlaced extends TotemCallerProjBase {
    get LightR() { return 0.5; }
    get LightG() { return 0.4; }
    get LightB() { return 0.15; }
    get AttackDistance() { return 550; }
    get AttackCooldown() { return 40; }

    Shoot(proj, target) {
        if (_shotType === -1) _shotType = ModProjectile.getTypeByName('FieryTotemPro') ?? -2;
        if (_shotType < 0) return;

        const origin = Vector2.new(proj.Center.X, proj.position.Y + MUZZLE_Y);
        const center = target.Center;

        const dx = center.X - origin.X;
        const dy = center.Y - origin.Y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const scale = length > SHOT_SPEED ? SHOT_SPEED / length : 1;

        const velocity = Vector2.new(dx * scale, dy * scale);
        MiscHelper.ModifyVelocityForGravity(origin, center, SHOT_GRAVITY, velocity, SHOT_NO_GRAVITY_TICKS, 16, 1, SHOT_OFFSET_CAP);

        NewProjectile(null, origin, velocity, _shotType, proj.damage, SHOT_KNOCKBACK, proj.owner, 0, 0, 0, null);
        PlaySound(Terraria.ID.SoundID.Item34, proj.Center, 0, 1);
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < DEATH_DUSTS; i++) {
            const fire = Main.dust[NewDust(proj.position, proj.width, proj.height, DUST_FIRE, proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 125, Color.White, 2.25)];
            if (fire) fire.noGravity = true;

            const ember = Main.dust[NewDust(proj.position, proj.width, proj.height, DUST_EMBER, proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 75, Color.White, 0.75)];
            if (ember) ember.noGravity = true;
        }
    }
}
