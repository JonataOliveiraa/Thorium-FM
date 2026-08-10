import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';
import { SoundHelper } from './../Global/Utils/SoundHelper.js';
import { ThoriumPlayer } from './../Global/ThoriumPlayer.js';
import { GraniteIonStaff, ION_SHIELD_CAP } from './../Items/Granite/GraniteIonStaff.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const DUST_GRANITE = 59;
const MAX_EMPOWER = 4;
const CHARGE_TIME = 20;
const BURST_SPEED = 6;
const SHIELD_DURATION = 600;

const SFX_CHARGE = ['Item24'];
const SFX_RELEASE = ['Item43', 'Item24'];

let _burstType = -1;

export class GraniteIonStaffPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 20;
        this.Projectile.height = 20;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.alpha = 255;
        this.Projectile.tileCollide = false;
        this.Projectile.ownerHitCheck = true;
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);
        const player = Main.player[proj.owner];
        if (!player || !player.active) return proj.Kill();

        const empower = ai[0];

        for (let i = 0; i < 1 + empower; i++) {
            const dust = Main.dust[Effects.NewDust(
                proj.position, proj.width, proj.height, DUST_GRANITE,
                Rand.Next(-6, 6), Rand.Next(-10, 10), 0, Color.White, 0.5 + empower * 0.25
            )];
            if (dust) dust.noGravity = true;
        }

        player.itemTime = 2;
        player.itemAnimation = 2;

        const center = player.Center;
        proj.position = Vector2.new(
            center.X - 10 + (player.direction === -1 ? -22 : 26),
            center.Y - 24
        );

        if (Main.myPlayer === proj.owner && (!player.channel || player.noItems || player.CCed)) {
            return proj.Kill();
        }

        if (++ai[1] < CHARGE_TIME) return;

        if (empower >= MAX_EMPOWER) return proj.Kill();

        SoundHelper.play(SFX_CHARGE, proj.Center.X, proj.Center.Y);
        ai[0] = empower + 1;
        ai[1] = 0;
    }

    OnKill(proj, timeLeft) {
        const ai = new ProjAI(proj, false);
        const empower = ai[0];
        if (empower <= 0) return;

        SoundHelper.play(SFX_RELEASE, proj.Center.X, proj.Center.Y);
        if (Main.myPlayer !== proj.owner) return;

        const player = Main.player[proj.owner];
        const shield = Math.min(ION_SHIELD_CAP, GraniteIonStaff.ShieldValue() * empower);
        ThoriumPlayer.GrantIonShield(player, shield, SHIELD_DURATION);

        if (_burstType < 0) _burstType = ModProjectile.getTypeByName('GraniteIonStaffPro2') ?? -1;
        if (_burstType < 0) return;

        const center = proj.Center;
        const aim = Vector2.Subtract(Main.MouseWorld, center);
        const len = Math.sqrt(aim.X * aim.X + aim.Y * aim.Y);
        const scale = (len > BURST_SPEED ? BURST_SPEED / len : 1) * 1.15;

        NewProjectile(
            null,
            center, Vector2.new(aim.X * scale, aim.Y * scale),
            _burstType, proj.damage, 3, proj.owner, empower, 0, 0, null
        );
    }
}
