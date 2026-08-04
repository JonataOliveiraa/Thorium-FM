import { Terraria, Modules, Microsoft } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ProjAI } from '../../../TL/ProjAI.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';
const GetLight = Terraria.Lighting['Color GetColor(int x, int y)'];

// Cada braco varre um setor de 60 graus em volta do polvo
const SECTOR = Math.PI / 3;
const MIN_LENGTH = 86;
const MAX_LENGTH = 100;
const ANGLE_SPEED = 0.01;
const LENGTH_SPEED = 1;
const WIDTH = 16;        // espessura usada na colisao
const SEGMENT = 20;      // tamanho do sprite de cada gomo

let _octopusType = -1;

export class OctopusArm extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'NPCs/AquaticDepths/' + this.constructor.name;
        this._tipTex = null;
        this._texLoaded = false;
    }

    SetDefaults() {
        this.Projectile.width = 1;
        this.Projectile.height = 1;
        this.Projectile.aiStyle = -1;
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 2;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.netImportant = true;
    }

    OnSpawn(proj) {
        proj.drawLayer = 2 //BehindNPCs 
    }

    _owner(proj) {
        if (_octopusType === -1) _octopusType = ModNPC.getTypeByName('Octopus');

        const index = new ProjAI(proj, false)[0] | 0;
        const npc = Main.npc[index];
        if (!npc || !npc.active || npc.type !== _octopusType) return null;
        return npc;
    }

    AI(proj) {
        const npc = this._owner(proj);
        if (!npc) {
            proj.Kill();
            return;
        }

        proj.timeLeft = 2;

        const ai = new ProjAI(proj, false);
        const local = new ProjAI(proj, true);

        const armIndex = ai[1] | 0;
        const minAngle = (armIndex - 0.5) * SECTOR;
        const maxAngle = (armIndex + 0.5) * SECTOR;
        const restAngle = (minAngle + maxAngle) / 2;

        if (local[0] <= 0) {
            local[0] = MIN_LENGTH;
            proj.rotation = restAngle;
        }

        const center = npc.Center;
        proj.position = Vector2.new(center.X, center.Y);
        proj.gfxOffY = npc.gfxOffY;

        const player = Main.player[npc.target];
        let wanted = restAngle;
        let wantedLength = MIN_LENGTH;

        if (player && player.active && !player.dead) {
            const dx = player.Center.X - center.X;
            const dy = player.Center.Y - center.Y;
            let angle = Math.atan2(dy, dx);

            // Normaliza o angulo pro mesmo giro do setor
            while (angle < minAngle - Math.PI) angle += Math.PI * 2;
            while (angle > maxAngle + Math.PI) angle -= Math.PI * 2;

            // So estica se o jogador estiver dentro do setor deste braco
            if (angle >= minAngle && angle <= maxAngle) {
                wanted = angle;
                wantedLength = Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Math.sqrt(dx * dx + dy * dy) + 32));
            } else {
                // Fora do setor: fica bailando de um lado pro outro
                wanted = restAngle + Math.sin(Main.GameUpdateCount / 60 + armIndex) * (SECTOR / 2);
            }
        }

        const diff = wanted - proj.rotation;
        proj.rotation += Math.max(-ANGLE_SPEED * 10, Math.min(ANGLE_SPEED * 10, diff * 0.1));

        const lengthDiff = wantedLength - local[0];
        local[0] += Math.max(-LENGTH_SPEED, Math.min(LENGTH_SPEED, lengthDiff));
    }

    // Colisao linha x retangulo, amostrada ao longo do braco
    Colliding(proj, myRect, targetRect) {
        const length = new ProjAI(proj, true)[0];
        if (length <= 0) return false;

        const cos = Math.cos(proj.rotation);
        const sin = Math.sin(proj.rotation);
        const steps = Math.ceil(length / (WIDTH * 0.75));

        const left = targetRect.X - WIDTH * 0.5;
        const top = targetRect.Y - WIDTH * 0.5;
        const right = targetRect.X + targetRect.Width + WIDTH * 0.5;
        const bottom = targetRect.Y + targetRect.Height + WIDTH * 0.5;

        for (let i = 0; i <= steps; i++) {
            const t = length * (i / steps);
            const x = proj.position.X + cos * t;
            const y = proj.position.Y + sin * t;
            if (x >= left && x <= right && y >= top && y <= bottom) return true;
        }

        return false;
    }

    PreDraw(proj, lightColor) {
        if (!this._texLoaded) {
            this._texLoaded = true;
            try { this._tipTex = tl.texture.load('Textures/NPCs/AquaticDepths/OctopusArmTip.png'); } catch (_) { }
        }

        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        if (!texture) return false;

        const length = new ProjAI(proj, true)[0];
        const segments = Math.max(1, Math.ceil(length / SEGMENT));
        const spacing = segments > 1 ? (length - SEGMENT) / (segments - 1) : 0;

        const cos = Math.cos(proj.rotation);
        const sin = Math.sin(proj.rotation);
        const origin = Vector2.new(texture.Width / 2, texture.Height / 2);
        const Draw = Main.spriteBatch[DRAW];

        for (let i = 1; i <= segments; i++) {
            const dist = spacing * (i - 1) + SEGMENT / 2;
            const x = proj.position.X + cos * dist;
            const y = proj.position.Y + sin * dist + proj.gfxOffY;
            const tex = (i === segments && this._tipTex) ? this._tipTex : texture;

            Draw(
                tex,
                Vector2.new(x - Main.screenPosition.X, y - Main.screenPosition.Y),
                null,
                GetLight(Math.floor(x / 16), Math.floor(y / 16)),
                proj.rotation, origin, 1,
                proj.spriteDirection === -1 ? SpriteEffects.FlipVertically : SpriteEffects.None, 0
            );
        }

        return false;
    }
}
