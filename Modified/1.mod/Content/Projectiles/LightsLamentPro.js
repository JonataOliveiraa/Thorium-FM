import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Rand, Vector2 } = Modules;
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

export class LightsLamentPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Empty';
    }

    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 8;
        this.Projectile.aiStyle = -1;
        this.Projectile.alpha = 255;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 300;
        this.Projectile.extraUpdates = 3;
    }

    OnHitNPC(proj, npc) {
        npc.AddBuff(ModBuff.getTypeByName('Enfeeble'), 600, false);
    }
    
    AI(proj) {
        if (proj.timeLeft === 293) {
            const num = 20;
            const NewDust = Terraria.Dust.NewDust;
            const dustArr = Terraria.Main.dust;
            const shader = Terraria.Graphics.Shaders.GameShaders.Armor.GetSecondaryShader(34, Terraria.Main.LocalPlayer);
            for (let index1 = 0; index1 < num; index1++) {
                const innerRotated = Vector2.RotatedBy(Vector2.UnitY, index1 * (6.2831854820251465 / num), Vector2.Zero);
                const scaled = Vector2.Multiply(Vector2.Negate(innerRotated), Vector2.new(5, 5));
                const dir = Vector2.RotatedBy(scaled, Vector2.ToRotation(proj.velocity), Vector2.Zero);
                const index2 = NewDust(proj.Center, 0, 0, 15, 0.0, 0.0, 255, Color.new(0, 0, 0), 1.5);
                const dust = dustArr[index2];
                dust.shader = shader;
                dust.noGravity = true;
                dust.position = Vector2.Add(proj.Center, dir);
                dust.velocity = Vector2.Multiply(Vector2.SafeNormalize(dir, Vector2.UnitY), 0.5);
            }
        }

        if (proj.timeLeft < 293) {
            for (let index3 = 0; index3 < 4; index3++) {
                const pos = Vector2.Subtract(proj.Center, Vector2.Multiply(proj.velocity, index3 * 0.25));
                const index4 = Terraria.Dust.NewDust(pos, 1, 1, 15, 0.0, 0.0, 255, Color.new(0, 0, 0), 1.15);
                const dust = Terraria.Main.dust[index4];
                dust.noGravity = true;
                dust.position = pos;
                dust.shader = Terraria.Graphics.Shaders.GameShaders.Armor.GetSecondaryShader(34, Terraria.Main.LocalPlayer);
                dust.velocity = Vector2.Multiply(dust.velocity, 0.0);
            }
        }

        const ai = new ProjAI(proj);
        const target = Vector2.new(ai[0], ai[1]);
        const distanceSQ = proj.DistanceSQ(target);
        const burst = ai[2] === 1.0;

        if (distanceSQ <= 100.0 && !burst) {
            ai[2] = 1.0;
            proj.timeLeft = 4;
            PlaySound(Terraria.ID.SoundID.Item24, proj.Center, 0, 1);
            const NewDust = Terraria.Dust.NewDust;
            const dustArr = Terraria.Main.dust;
            const shader = Terraria.Graphics.Shaders.GameShaders.Armor.GetSecondaryShader(34, Terraria.Main.LocalPlayer);
            for (let index5 = 0; index5 < 25; index5++) {
                const index6 = NewDust(proj.Center, 10, 10, 15, Rand.Next(-10, 10), Rand.Next(-10, 10), 255, null, 1.75);
                const dust = dustArr[index6];
                dust.shader = shader;
                dust.noGravity = true;
            }
        }

        if (!burst) return;

        const v = proj.velocity;
        v.X = 0.0;
        v.Y = 0.0;
        proj.velocity = v;
        proj.tileCollide = false;

        let pos = proj.position;
        pos.X += Math.floor(proj.width / 2);
        pos.Y += Math.floor(proj.height / 2);
        proj.position = pos;

        proj.width = 200;
        proj.height = 200;

        pos = proj.position;
        pos.X -= Math.floor(proj.width / 2);
        pos.Y -= Math.floor(proj.height / 2);
        proj.position = pos;
    }

    OnTileCollide(proj, oldVelocity) {
        const ai = new ProjAI(proj);
        if (ai[2] !== 1.0) {
            ai[2] = 1.0;
            proj.timeLeft = 4;
            PlaySound(Terraria.ID.SoundID.Item24, proj.Center, 0, 1);
            const NewDust = Terraria.Dust.NewDust;
            const dustArr = Terraria.Main.dust;
            const shader = Terraria.Graphics.Shaders.GameShaders.Armor.GetSecondaryShader(34, Terraria.Main.LocalPlayer);
            for (let index1 = 0; index1 < 25; index1++) {
                const index2 = NewDust(proj.Center, 10, 10, 15, Rand.Next(-10, 10), Rand.Next(-10, 10), 255, Color.new(0, 0, 0), 1.75);
                const dust = dustArr[index2];
                dust.shader = shader;
                dust.noGravity = true;
            }
        }
        proj.velocity = Vector2.Zero;
        return false;
    }
}