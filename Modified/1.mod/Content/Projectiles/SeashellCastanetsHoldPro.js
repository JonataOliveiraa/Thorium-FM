import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Effects } from '../../TL/Modules/Effects.js';
import { Rand } from '../../TL/Modules/Rand.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { Empowerments } from '../Global/Empowerments.js';
import { ThoriumPlayer } from '../Global/ThoriumPlayer.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class SeashellCastanetsHoldPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name; // textura com 2 frames
    }

    SetDefaults() {
        this.Projectile.width = 22;
        this.Projectile.height = 20;
        this.Projectile.penetrate = -1;
        this.Projectile.tileCollide = false;
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);       // ai[0] = empowerLevel, ai[1] = killFlag
        const localAI = new ProjAI(proj, true);   // localAI[0] = timer1, localAI[1] = timer2
        const player = Main.player[proj.owner];

        if (ai[1] === 0) { // Enquanto não deve morrer
            if (player.channel && !player.noItems && !player.CCed) {
                const mousePos = Main.MouseWorld;
                const dir = Vector2.Subtract(mousePos, player.Center);
                const vel = Vector2.Multiply(Vector2.Normalize(dir), 12);
                proj.velocity = vel;
            } else if (Main.myPlayer === proj.owner) {
                ai[1] = 1;

                const from = player.RotatedRelativePoint(player.MountedCenter, false, true);
                const dirToMouse = Vector2.Normalize(Vector2.Subtract(Main.MouseWorld, from));
                const shootSpeed = player.HeldItem?.shootSpeed ?? 8; // fallback para 8
                const speed = shootSpeed * (1 + 0.2 * ai[0]);
                const damage = Math.floor(proj.damage * (1 + ai[0]));
                const kb = proj.knockBack * (1 + ai[0]);

                NewProjectile(
                    proj.GetProjectileSource_FromThis(),
                    proj.Center,
                    Vector2.Multiply(dirToMouse, speed),
                    ModProjectile.getTypeByName('SeashellCastanetsProj'),
                    damage, kb, proj.owner, 0, ai[0], 0, null
                );

                NewProjectile(
                    proj.GetProjectileSource_FromThis(),
                    proj.Center,
                    Vector2.Multiply(dirToMouse, 0.1),
                    ModProjectile.getTypeByName('SeashellCastanetsEffect'),
                    0, 0, proj.owner, 0, 0, 0, null
                );
                
                Empowerments.Apply(player, "AquaticAbility", 1);
                Effects.PlaySound(Terraria.ID.SoundID.NPCHit32, proj.position.X, proj.position.Y);
            }
        }

        if (ai[1] === 1) {
            proj.frame = 1;
            localAI[1]++;
            if (localAI[1] >= 10) proj.Kill();
        } else if (ai[0] < 2) {
            ThoriumPlayer.class.Bard.inspirationRegenTimer = -60;
            ThoriumPlayer.class.Bard.inspirationRegenBase = 0;

            localAI[0]++;
            if (localAI[0] >= 20) {
                for (let i = 0; i < 10; i++) {
                    const dust = Terraria.Dust.NewDustDirect(proj.position, proj.width, proj.height, 176,
                        Rand.NextFloat(-3, 4), Rand.NextFloat(-3, 4), 0, Color.White, 1);
                    dust.noGravity = true;
                }
                if (ai[0] === 1) {
                    Effects.PlaySound(Terraria.ID.SoundID.Item35, proj.Center.X, proj.Center.Y);
                } else {
                    Effects.PlaySound(Terraria.ID.SoundID.Item66, proj.Center.X, proj.Center.Y); // placeholder maraca
                }
                ai[0]++;
                localAI[0] = 0;
            }
        }

        const from2 = player.RotatedRelativePoint(player.MountedCenter, false, true);
        proj.Center = Vector2.Add(from2, Vector2.Multiply(proj.velocity, 0.25));
        proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI / 2;
        proj.spriteDirection = proj.direction;

        player.ChangeDir(proj.direction);
        player.heldProj = proj.whoAmI;
        player.itemTime = 2;
        player.itemAnimation = 2;
    }
}