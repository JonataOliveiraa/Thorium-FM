import { Terraria, Modules, Microsoft } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { SoundHelper } from '../Global/Utils/SoundHelper.js';
import { Rectangle } from '../../TL/Modules/Rectangle.js';

const { Vector2 } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const FRAMES = 3;
const FRAME_RATE = 10;    // ticks por quadro das asas
const BAT_EVERY = 3;      // solta um morcego a cada N quadros
const BAT_RANGE = 900;
const BAT_SPEED = 10;
const BAT_DAMAGE = 0.5;   // fracao do dano do ioio

let _batType = -1;

// Corpo e asas usam o mesmo quadro, tirado do relogio do jogo: a AI de ioio da
// vanilla mexe no frame/frameCounter do projetil.
function wingFrame() {
    return Math.floor(Main.GameUpdateCount / FRAME_RATE) % FRAMES;
}

function batType() {
    if (_batType !== -1) return _batType;
    try { _batType = Terraria.ID.ProjectileID.Bat ?? 316; } catch (_) { _batType = 316; }
    return _batType;
}

export class BatWingPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.timer = 0;
        this._wingsTex = null;
        this._texLoaded = false;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
        Terraria.ID.ProjectileID.Sets.YoyosLifeTimeMultiplier[this.Type] = 5;
        Terraria.ID.ProjectileID.Sets.YoyosMaximumRange[this.Type] = 200;
        Terraria.ID.ProjectileID.Sets.YoyosTopSpeed[this.Type] = 10;
    }

    SetDefaults() {
        this.Projectile.width = 18;
        this.Projectile.height = 18;
        this.Projectile.aiStyle = Terraria.ID.ProjAIStyleID.Yoyo;
        this.Projectile.friendly = true;
        this.Projectile.melee = true;
        this.Projectile.penetrate = -1;
        this.Projectile.extraUpdates = 0;
        this.Projectile.drawLayer = 7;
        this.Projectile.scale = 1;
    }

    OnSpawn(proj) {
        this.timer = 0;
    }

    _load() {
        if (this._texLoaded) return;
        this._texLoaded = true;
        try { this._wingsTex = tl.texture.load('Textures/Projectiles/BatWingPro_Wings.png'); } catch (_) { }
    }

    // Roda depois da AI de ioio da vanilla: animacao e morcegos
    AI(proj) {
        proj.frame = wingFrame();

        if (++this.timer < FRAME_RATE * BAT_EVERY) return;
        this.timer = 0;

        if (Main.myPlayer !== proj.owner) return;
        this._releaseBat(proj);
    }

    _releaseBat(proj) {
        const center = proj.Center;
        let bestX = 0, bestY = 0, bestDist = BAT_RANGE;
        let found = false;

        for (let i = 0; i < Main.maxNPCs; i++) {
            const npc = Main.npc[i];
            if (!npc || !npc.active || npc.friendly || npc.townNPC || npc.dontTakeDamage) continue;

            const c = npc.Center;
            const dx = c.X - center.X;
            const dy = c.Y - center.Y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist >= bestDist) continue;

            bestDist = dist;
            bestX = dx;
            bestY = dy;
            found = true;
        }

        if (!found) return;

        const dist = bestDist || 1;
        SoundHelper.play(['Item17', 'Item2'], center.X, center.Y, 0.2, 0.6);

        const index = NewProjectile(
            Terraria.Projectile.GetNoneSource(),
            center.X, center.Y,
            bestX / dist * BAT_SPEED, bestY / dist * BAT_SPEED,
            batType(), Math.floor(proj.damage * BAT_DAMAGE), 2, proj.owner, 0, 0, 0, null
        );

        const bat = Main.projectile[index];
        if (bat) {
            bat.timeLeft = 120;
            bat.melee = true;
        }
    }

    // Asas batendo por cima do corpo do ioio
    PostDraw(proj, lightColor) {
        this._load();
        if (!this._wingsTex) return;

        const frameHeight = Math.floor(this._wingsTex.Height / FRAMES);
        const src = Rectangle.new(0, wingFrame() * frameHeight, this._wingsTex.Width, frameHeight);

        Main.spriteBatch[DRAW](
            this._wingsTex,
            Vector2.new(
                proj.Center.X - Main.screenPosition.X,
                proj.Center.Y - Main.screenPosition.Y + proj.gfxOffY
            ),
            src, lightColor, 0,
            Vector2.new(this._wingsTex.Width / 2, frameHeight / 2), proj.scale,
            SpriteEffects.None, 0
        );
    }
}
