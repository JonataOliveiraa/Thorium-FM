import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { MathHelper, Rand, Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

const MOVE_DISTANCE = 50;

export class ObsidianStaffPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Empty';
    }

    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 20;
        this.Projectile.magic = true;
        this.Projectile.alpha = 255;
        this.Projectile.penetrate = -1;
        this.Projectile.tileCollide = false;
        this.Projectile.hide = true;
    }
    
    AI(proj) {
        proj.position = proj.oldPosition;
        
        const ai = new ProjAI(proj);
        let killProjectile = false;
        
        const player = Terraria.Main.player[proj.owner];
        const mousePosition = Terraria.Main.MouseWorld;
        const vector2 = Vector2.SafeNormalize(Vector2.Subtract(mousePosition, player.Center), Vector2.Negate(Vector2.UnitY));
        proj.velocity = vector2;
        proj.direction = vector2.X > 0.0 ? 1 : -1;
        const velocity = proj.velocity;
        velocity.X *= proj.velocity.X < 0.0 ? 1.2 : 0.9;
        proj.position = Vector2.Add(player.Center, Vector2.Multiply(velocity, 50));
        proj.timeLeft = 2;
        let direction = proj.direction;
        player.ChangeDir(direction);
        player.heldProj = proj.whoAmI;
        player.itemTime = player.itemAnimation = 2;
        player.itemRotation = Math.atan2(proj.velocity.Y * direction, proj.velocity.X * direction);
        if (!player.channel || player.noItems || player.CCed) {
            killProjectile = true;
        } else {
            ai[1]++;
            if (ai[1] === 30) PlaySound(Terraria.ID.SoundID.Item20, proj.Center, 0, 1);
            if (ai[1] >= 60) killProjectile = true;
        }
        const sourceFromThis = proj.GetProjectileSource_FromThis();
        if (killProjectile) {
            if (ai[1] >= 60) {
                if (Terraria.Main.myPlayer === proj.owner) {
                    const vector2_1 = proj.Center;
                    vector2_1.Y -= 10;
                    let vector2_2 = Vector2.Subtract(Terraria.Main.MouseWorld, vector2_1);
                    let num1 = 10, num2 = vector2_2['float Length()']();
                    if (num2 > num1) {
                        let num3 = num1 / num2;
                        vector2_2 = Vector2.Multiply(vector2_2, num3);
                    }
                    NewProjectile(sourceFromThis, vector2_1, vector2_2, ModProjectile.getTypeByName('ObsidianStaffPro3'), proj.damage * 2.0, proj.knockBack * 2.0, proj.owner, 0.0, 1.0, 0.0, null);
                }
                PlaySound(Terraria.ID.SoundID.Item69, proj.Center, 0, 1);
            } else if (ai[1] >= 30) {
                if (Terraria.Main.myPlayer === proj.owner) {
                    const vector2_3 = proj.Center;
                    vector2_3.Y -= 10;
                    let vector2_4 = Vector2.Subtract(Terraria.Main.MouseWorld, vector2_3);
                    let num4 = 8, num5 = vector2_4['float Length()']();
                    if (num5 > num4) {
                        let num6 = num4 / num5;
                        vector2_4 = Vector2.Multiply(vector2_4, num6);
                    }
                    NewProjectile(sourceFromThis, vector2_3, vector2_4, ModProjectile.getTypeByName('ObsidianStaffPro3'), proj.damage, proj.knockBack * 1.5, proj.owner, 0.0, 0.0, 0.0, null);
                }
                PlaySound(Terraria.ID.SoundID.Item69, proj.Center, 0, 1);
            } else {
                if (Terraria.Main.myPlayer === proj.owner) {
                    const vector2_5 = proj.Center;
                    vector2_5.Y -= 10;
                    let vector2_6 = Vector2.Subtract(Terraria.Main.MouseWorld, vector2_5);
                    let num7 = 8, num8 = vector2_6['float Length()']();
                    if (num8 > num7) {
                        let num9 = num7 / num8;
                        vector2_6 = Vector2.Multiply(vector2_6, num9);
                    }
                    let num10 = 1 + Math.floor(proj.ai.val1 / 10);
                    for (let index = 0; index < num10; index++) {
                        let vector2_7 = Vector2.Multiply(Terraria.Utils.RotatedByRandom(vector2_6, MathHelper.ToRadians(10)), 1 - Rand.NextFloat() * 0.3);
                        NewProjectile(sourceFromThis, Vector2.new(proj.Center.X, proj.Center.Y - 10), vector2_7, ModProjectile.getTypeByName('ObsidianStaffPro2'), Math.floor(proj.damage * 0.5), proj.knockBack, proj.owner, 0.0, 0.0, 0.0, null);
                    }
                }
                PlaySound(Terraria.ID.SoundID.Item20, proj.Center, 0, 1);
                for (let index = 0; index < 10; index++) {
                    Terraria.Dust.NewDustDirect(proj.position, 10, 10, 240, Rand.NextFloat(-4, 4), Rand.NextFloat(-4, 4), 150, null, 1).noGravity = true;
                }
            }
            proj.Kill();
        }
        let vector2_8 = Vector2.new(Rand.Next(-25, 26), Rand.Next(-25, 26));
        let vector2_9 = Vector2.Add(proj.position, vector2_8);
        let num11 = 0.6 + 0.01 * ai[1];
        let dust = Terraria.Dust.NewDustDirect(vector2_9, 10, 10, 240, 0, 0, 150, null, num11);
        dust.noGravity = true;
        dust.velocity = Vector2.Multiply(Vector2.Negate(vector2_8), 0.05);
    }
}

export class ObsidianStaffPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 10;
        this.Projectile.aiStyle = 14;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 120;
        this.AIType = 24;
        this.fadeOutTime = 20;
        this.fadeOutSpeed = 10;
    }
    
    OnTileCollide(proj) {
        proj.position = proj.oldPosition;
        proj.velocity = Vector2.Zero;
        return false;
    }
}

export class ObsidianStaffPro3 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 2;
    }
    
    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 32;
        this.Projectile.magic = true;
        this.Projectile.aiStyle = 14;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 120;
        this.AIType = 24;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 120;
    }
    
    OnHitNPC(proj, npc) {
        if (proj.ai.val1 <= 0) return;
        PlaySound(Terraria.ID.SoundID.Item74, proj.Center, 0, 1);
        const npcArr = Terraria.Main.npc;
        for (let i = 0; i < Terraria.Main.maxNPCs; i++) {
            const npc = npcArr[i];
            if (npc.CanBeChasedBy(null, false) && npc.DistanceSQ(proj.Center) < 40000.0) {
                npc.AddBuff(24, 300, false);
            }
        }
        for (let index1 = 0; index1 < 15; index1++) {
            let index2 = Terraria.Dust.NewDust(proj.position, proj.width / 2, proj.height / 2, 174, Rand.NextFloat(-12, 12), Rand.NextFloat(-12, 12), 0, null, 1.5);
            Terraria.Main.dust[index2].noGravity = true;
        }
        new ProjAI(proj)[1] = 0;
        proj.netUpdate = true;
    }
    
    AI(proj) {
        if (proj.ai.val1 > 0) {
            proj.frame = 1;
            const dustArr = Terraria.Main.dust;
            for (let index1 = 0; index1 < 2; index1++) {
                let index2 = Terraria.Dust.NewDust(Vector2.Subtract(proj.position, proj.velocity), proj.width, proj.height, 6, 0, 0, 0, null, 1.35);
                let dust = dustArr[index2];
                dust.velocity = Vector2.Multiply(dust.velocity, 0);
                dust.noGravity = true;
            }
        }
        else {
            proj.frame = 0;
        }
    }
    
    OnTileCollide(proj) {
        proj.position = proj.oldPosition;
        proj.velocity = Vector2.Zero;
        return false;
    }
    
    OnKill(proj, timeLeft) {
        const dustArr = Terraria.Main.dust;
        for (let index1 = 0; index1 < 15; index1++) {
            let index2 = Terraria.Dust.NewDust(proj.position, proj.width, proj.height, 240, Rand.NextFloat(-6, 6), Rand.NextFloat(-6, 6), 150, null, 1);
            dustArr[index2].noGravity = true;
            let index3 = Terraria.Dust.NewDust(proj.position, proj.width, proj.height, 240, Rand.NextFloat(-3, 3), Rand.NextFloat(-3, 3), 50, null, 1.5);
            dustArr[index3].noGravity = true;
        }
    }
}