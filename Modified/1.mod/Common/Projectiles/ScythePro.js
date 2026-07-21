import { ThoriumPlayer } from '../../Content/Global/ThoriumPlayer.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModItem } from '../../TL/ModItem.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Effects } from '../../TL/Modules/Effects.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

const NewDustPerfect = Terraria.Dust.NewDustPerfect;

export class ScythePro extends ModProjectile {
    constructor() {
        super();
        this.rotationSpeed = 0.25;   
        this.scytheCount = 2;
        this.dustCount = 1;
        this.dustType = -1;
        this.dustOffset = Vector2.Zero; 
    }

    get DustCenterBase() {
        return Vector2.new(
            this.Projectile.width / 2,
            -this.Projectile.height / 2
        );
    }

    get DustCenter() {
        return Vector2.Add(this.DustCenterBase, this.dustOffset);
    }

    SetDefaults() {
        this.Projectile.aiStyle = 0;
        this.Projectile.light = 0.2;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = false;
        this.Projectile.ownerHitCheck = true;
        this.Projectile.ignoreWater = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 26;
        this.Projectile.idStaticNPCHitCooldown = 10;
        this.Projectile.localNPCHitCooldown = 10;
    }

    AI(proj) {
        const player = Main.player[proj.owner];
        if (player.dead) {
            proj.Kill();
            return;
        }

        proj.rotation += player.direction * this.rotationSpeed;
        proj.spriteDirection = player.direction;

        player.heldProj = proj.whoAmI;
        proj.Center = player.Center;
        proj.gfxOffY = player.gfxOffY;

        this.SpawnDust(proj);
    }

    SpawnDust(proj) {
        const scytheCount = this.scytheCount;
        const dustCount = this.dustCount;
        const dustType = this.dustType;
        const dustCenter = this.DustCenter;

        if (scytheCount <= 0 || dustCount <= 0 || dustType <= -1) return;

        for (let scytheIndex = 0; scytheIndex < scytheCount; scytheIndex++) {
            const angle = (scytheIndex / scytheCount) * Math.PI * 2;
            const rotation = proj.rotation;

            let offset = dustCenter;
            if (proj.spriteDirection < 0) {
                offset = Vector2.new(-offset.X, offset.Y);
            }

            const rotatedOffset = Vector2.RotatedBy(offset, rotation + angle, Vector2.Zero);

            const position = Vector2.Add(
                Vector2.Add(proj.Center, Vector2.new(0, proj.gfxOffY)),
                rotatedOffset
            );

            for (let i = 0; i < dustCount; i++) {
                const dust = NewDustPerfect(position, dustType, Vector2.Zero, 0, Color.White, 1.0);
                if (dust) {
                    dust.noGravity = true;
                    dust.noLight = true;
                }
            }
        }
    }

    OnHitNPC(proj, npc) {
        const player = Terraria.Main.player[Terraria.Main.myPlayer]
        const item = ModItem.getModItem(player.HeldItem.type);
        if(!item.isScytheSoul) return;
        
        item.soulEssenceStack++

        if (item.soulEssenceStack >= ThoriumPlayer.soulEssenceStackMax) {
            Effects.PlaySound(Terraria.ID.SoundID.Item20, player.Center.X, player.Center.Y)
            ThoriumPlayer.ApplySoulEssenceEffect(player)
            item.soulEssenceStack = 1
        }

        player.AddBuff(ModBuff.getTypeByName('SoulEssenceBuff'), 1800, false)
    }
}