import { Terraria, Modules, Microsoft } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModBuff } from './../../TL/ModBuff.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { Rectangle } from '../../TL/Modules/Rectangle.js';

const { Main } = Terraria;
const { Vector2, Color } = Modules;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;

export class EnchantedCanePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Main.projFrames[this.Type] = 1;
        
        Terraria.ID.ProjectileID.Sets.TrackMinionSpawnFromItemUse[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.CultistIsResistantTo[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.MinionSacrificable[this.Type] = true;
        // Removi o MinionTargetingFeature, pois ele não persegue alvos marcados
    }
    
    SetDefaults() {
        this.Projectile.width = 34; 
        this.Projectile.height = 34; 
        this.Projectile.penetrate = -1; // -1 significa que não some ao atravessar inimigos
        this.Projectile.aiStyle = -1
        this.Projectile.minion = true;
        this.Projectile.friendly = true; // Necessário para causar dano aos inimigos
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.minionSlots = 1;
        this.Projectile.timeLeft = 18000;
        this.Projectile.netImportant = true;
        
        // Faz com que ele ataque continuamente quem encostar nele
        this.Projectile.usesLocalNPCImmunity = true; 
        this.Projectile.localNPCHitCooldown = 20; // Dá dano a cada 20 frames (3x por segundo)
    }

    PreAI(proj) {
        if (!this.MinionBuff) this.MinionBuff = ModBuff.getTypeByName('EnchantedCaneBuff');
        return true;
    }

    AI(proj) {
        const player = Main.player[proj.owner];
        if (!this.CheckActive(proj, player)) return;

        const ai = new ProjAI(proj, false);

        if (ai[1] > 0) ai[1]--;

        const orbitRadius = 80;
        const orbitSpeed = 0.05;

        ai[0] += orbitSpeed;
        if (ai[0] > Math.PI * 2) ai[0] -= Math.PI * 2;

        const offsetX = Math.cos(ai[0]) * orbitRadius;
        const offsetY = Math.sin(ai[0]) * orbitRadius;

        proj.Center = Vector2.Add(player.Center, Vector2.new(offsetX, offsetY));
        proj.velocity = player.velocity;
    }

    CanDamage(proj) {
        const ai = new ProjAI(proj, false);
        return ai[1] <= 0;
    }

    CheckActive(proj, player) {
        if (player.dead || !player.active) {
            player.ClearBuff(this.MinionBuff);
            return false;
        }
        if (player.FindBuffIndex(this.MinionBuff) >= 0) {
            proj.timeLeft = 2; // Mantém o minion vivo enquanto tiver o buff
        }
        return true;
    }

    OnHitNPC(proj, npc) {
        npc.AddBuff(ModBuff.getTypeByName('StunnedBuff'), 60, true);

        const ai = new ProjAI(proj, false);
        ai[1] = 70;
    }

    PreDraw(proj, lightColor) {
        const ai = new ProjAI(proj, false);
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        const frame = Rectangle.new(0, 0, texture.Width, texture.Height);
        const origin = Vector2.new(texture.Width * 0.5, texture.Height * 0.5);
        const drawPos = Vector2.Subtract(proj.Center, Main.screenPosition);
        const effects = SpriteEffects.None;
        const scale = proj.scale * 1.2;

        let alpha;
        if (ai[1] > 0) {
            const pulse = Math.sin((70 - ai[1]) * 0.2) * 0.4 + 0.4;
            alpha = pulse;
        } else {
            alpha = 0.8;
        }

        const color = Color.Lerp(Color.Transparent, Color.Cyan, alpha);

        Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'](
            texture, drawPos, frame, color, proj.rotation, origin, scale, effects, 0
        );

        return false;
    }
}