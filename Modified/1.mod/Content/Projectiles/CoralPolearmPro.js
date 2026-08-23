import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ThoriumPlayer } from './../Global/ThoriumPlayer.js';

const { Color, Rand, Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const STRIKES_NEEDED = 4;

export class CoralPolearmPro extends ModProjectile {
    coralShoot = false;
    
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        this.colorArray = [
            Color.new(255, 183, 220),
            Color.new(105, 255, 164),
            Color.new(111, 251, 255)
        ];
    }

    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 26;
        this.Projectile.melee = true;
        this.Projectile.aiStyle = 19;
        this.Projectile.friendly = true;
        //this.Projectile.hide = true; // ???
        this.Projectile.ownerHitCheck = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 600;
        this.Projectile.tileCollide = false;
        this.AIType = 368;
    }
    
    OnHitNPC(proj, npc) {
        const player = Terraria.Main.player[proj.owner];
        if (ThoriumPlayer.coralPolearmCharge >= STRIKES_NEEDED) return;
        ThoriumPlayer.coralPolearmCharge++;
        let num1 = ThoriumPlayer.coralPolearmCharge <= STRIKES_NEEDED ? (ThoriumPlayer.coralPolearmCharge >= STRIKES_NEEDED ? 12 : 5) : 0;
        for (let index1 = 0; index1 < num1; index1++) {
            let index2 = Terraria.Dust.NewDust(player.position, player.width, player.height, 294, 0, 0, 0, this.colorArray[Rand.Next(this.colorArray.length)], 0.8);
            Terraria.Main.dust[index2].noGravity = true;
            const dust = Terraria.Main.dust[index2];
            dust.velocity = Vector2.Multiply(dust.velocity, 0.75);
            let num2 = Rand.Next(-45, 46);
            let num3 = Rand.Next(-45, 46);
            const pos = dust.position;
            pos.X += num2; pos.Y += num3;
            dust.position = pos;
            const v = dust.velocity;
            v.X = -num2 * 0.075000002980232239;
            v.Y = -num3 * 0.075000002980232239;
            dust.velocity = v;
        }
    }

    AI(proj) {
        const player = Terraria.Main.player[proj.owner];
        if (Terraria.Main.myPlayer !== proj.owner) return;
        if (proj.timeLeft === 600 && ThoriumPlayer.coralPolearmCharge >= STRIKES_NEEDED) {
            this.coralShoot = true;
        }
        if (player.itemAnimation >= player.itemAnimationMax / 3 || !this.coralShoot) {
            return;
        }
        NewProjectile(proj.GetProjectileSource_FromThis(), proj.Center, Vector2.Multiply(proj.velocity, 1.25), ModProjectile.getTypeByName('CoralPolearmPro2'), 5, proj.knockBack, proj.owner, 0, 0, 0, null);
        this.coralShoot = false;
        ThoriumPlayer.coralPolearmCharge = 0;
    }
}