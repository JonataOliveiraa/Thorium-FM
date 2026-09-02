import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ProjAI } from './../../../TL/ProjAI.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

export class SwordOfDestinyPro extends ModProjectile {
    static ALIVE_HEIGHT = 38;
    static DEATH_HEIGHT = 18;
    static DEATH_FRAME = 1;
    static STUCK_LIMIT = -180;
    static HOVER_Y = -72;
    static HOVER_X = -8;
    static MAX_LEAN = 0.2;

    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
        this.buffType = 0;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 4;
        Main.projPet[this.Type] = true;

        // Sem isto a tela de selecao de personagem trava ao tentar animar o pet.
        Terraria.ID.ProjectileID.Sets.CharacterPreviewAnimations[this.Type] = Terraria.ID.ProjectileID.Sets.SimpleLoop(
            0, Main.projFrames[this.Type],
            45, false
        )['SettingsForCharacterPreview WithOffset(float x, float y)'](
            -5, -20
        ).WithSpriteDirection(1);
    }

    SetDefaults() {
        this.Projectile.width = 18;
        this.Projectile.height = SwordOfDestinyPro.ALIVE_HEIGHT;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.tileCollide = false;
        this.Projectile.hide = false;
        this.Projectile.netImportant = true;
        this.Projectile.timeLeft = 18000;
    }

    OnSpawn(proj) {
        const ai = new ProjAI(proj, false);
        ai[0] = 0;
        ai[1] = 0;
    }

    AI(proj) {
        if (!this.buffType) this.buffType = ModBuff.getTypeByName('SwordOfDestinyBuff');

        const player = Main.player[proj.owner];
        const ai = new ProjAI(proj, false);

        if (player.dead) {
            this.DeathFall(proj, player, ai);
            return;
        }

        if (player.FindBuffIndex(this.buffType) >= 0) proj.timeLeft = 2;

        proj.tileCollide = false;
        proj.hide = false;
        proj.height = SwordOfDestinyPro.ALIVE_HEIGHT;
        ai[1] = 0;

        this.Lean(proj, player);
        this.Hover(proj, player, ai);
        this.Animate(proj);
    }

    DeathFall(proj, player, ai) {
        proj.frame = SwordOfDestinyPro.DEATH_FRAME;

        if (ai[1] === 0) {
            proj.rotation = 0;
            proj.velocity = Vector2.new(0, 0.1);
            proj.height = SwordOfDestinyPro.DEATH_HEIGHT;
        }

        if (ai[1] >= 0) {
            ai[1] = ai[1] + 1;
            if (proj.Bottom.Y > player.Center.Y) {
                proj.hide = true;
                proj.tileCollide = true;
            }
        } else {
            ai[1] = ai[1] - 1;
            if (ai[1] <= SwordOfDestinyPro.STUCK_LIMIT) {
                proj.Kill();
                return;
            }
        }

        if (proj.velocity.Y === 0) {
            proj.hide = false;
            if (ai[1] >= 0) ai[1] = -1;
        }

        const vel = proj.velocity;
        proj.velocity = Vector2.new(vel.X, vel.Y + 0.2);
    }

    Lean(proj, player) {
        const vx = player.velocity.X;
        const max = SwordOfDestinyPro.MAX_LEAN;

        if (vx > 1.5) {
            proj.rotation -= 0.005;
            if (proj.rotation < -max) proj.rotation = -max;
        } else if (vx === 0 && proj.rotation !== 0) {
            proj.rotation += (proj.rotation > 0 ? -1 : 1) * 0.005;
        }

        if (vx < -1.5) {
            proj.rotation += 0.005;
            if (proj.rotation > max) proj.rotation = max;
        }
    }

    Hover(proj, player, ai) {
        const missing = 1 - (player.statLife + 1) / player.statLifeMax2;

        ai[0] = ai[0] + 0.05 + missing * 0.15;
        if (ai[0] > Math.PI * 2) ai[0] = 0;

        const bob = Math.floor(Math.sin(ai[0]) * (3 + missing * 2));

        proj.position = Vector2.new(
            player.Center.X + SwordOfDestinyPro.HOVER_X,
            player.Center.Y + SwordOfDestinyPro.HOVER_Y + bob
        );
        proj.gfxOffY = player.gfxOffY;
        proj.direction = 1;
        proj.spriteDirection = 1;
    }

    Animate(proj) {
        const max = Main.projFrames[this.Type];

        proj.frameCounter++;
        if (proj.frameCounter >= 90 && proj.frame % 2 === 0) {
            proj.frameCounter = 0;
            proj.frame = (proj.frame + 1) % max;
            return;
        }

        proj.frameCounter++;
        if (proj.frameCounter < 45) return;
        proj.frameCounter = 0;
        proj.frame = (proj.frame + 1) % max;
    }
}
