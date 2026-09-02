import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Rand, Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

const LIFETIME = 90;

const EXTRA_GRAVITY = 0.085;

const DUST_SHELL = 32;
const KILL_DUST_COUNT = 10;
const KILL_DUST_ALPHA = 100;
const KILL_DUST_SCALE = 1.35;

const EATER_COUNT = 4;
const EATER_SPEED = 3;

let _eaterType = -1;

export class DevourerStaffPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.SentryShot[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.width = 22;
        this.Projectile.height = 22;

        this.Projectile.aiStyle = Terraria.ID.ProjAIStyleID.Arrow;

        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = LIFETIME;
        this.Projectile.ignoreWater = true;
    }

    AI(proj) {
        const vel = proj.velocity;
        proj.velocity = Vector2.new(vel.X, vel.Y + EXTRA_GRAVITY);
        proj.rotation = 0;

        const local = new ProjAI(proj, true);
        if (local[0] !== 0) return;

        local[0] = 1;
        PlaySound(Terraria.ID.SoundID.NPCHit13, proj.Center, 0, 1);
    }

    OnKill(proj, timeLeft) {
        PlaySound(Terraria.ID.SoundID.NPCHit1, proj.position, 0, 1);

        if (Main.myPlayer === proj.owner) {
            if (_eaterType === -1) _eaterType = ModProjectile.getTypeByName('DevourerStaffPro3') ?? -2;
            if (_eaterType >= 0) {
                for (let i = 0; i < EATER_COUNT; i++) {
                    NewProjectile(
                        null,
                        proj.Center,
                        Vector2.new(
                            Rand.NextFloat(-EATER_SPEED, EATER_SPEED),
                            Rand.NextFloat(-EATER_SPEED, EATER_SPEED)
                        ),
                        _eaterType, proj.damage, proj.knockBack, proj.owner, 0, 0, 0, null
                    );
                }
            }
        }

        for (let i = 0; i < KILL_DUST_COUNT; i++) {
            const dust = NewDustDirect(
                proj.position, proj.width, proj.height, DUST_SHELL,
                Rand.Next(-5, 4), Rand.Next(-5, 5),
                KILL_DUST_ALPHA, Color.Transparent, KILL_DUST_SCALE
            );
            if (dust) dust.noGravity = true;
        }
    }
}
