import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const { Main } = Terraria;
const NEW_PROJECTILE = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let sentryType = -1;

export class BoulderProbeStaff extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/GraniteEnergyStorm/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.SetWeaponValues(22, 3, 4);
        this.Item.summon = true;
        this.Item.sentry = true;
        this.Item.mana = 15;
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.useTime = 32;
        this.Item.useAnimation = 32;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.noMelee = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.UseSound = Terraria.ID.SoundID.Item44;
        this.Item.shoot = ModProjectile.getTypeByName('BoulderProbeStaffPro');
    }

    // Botao direito recolhe a sonda.
    AltFunctionUse(item, player) {
        return true;
    }

    // Recolher nao deve cobrar mana.
    ModifyManaCost(item, player, mana) {
        return player.altFunctionUse === 2 ? 0 : mana;
    }

    _recallSentries(player) {
        for (let index = 0; index < Main.maxProjectiles; index++) {
            const proj = Main.projectile[index];
            if (!proj || !proj.active) continue;
            if (proj.owner !== player.whoAmI || proj.type !== sentryType) continue;

            proj.Kill();
        }
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        if (sentryType < 0) sentryType = ModProjectile.getTypeByName('BoulderProbeStaffPro') ?? -1;
        if (sentryType < 0) return false;

        if (player.altFunctionUse === 2) {
            this._recallSentries(player);
            return false;
        }

        // A sonda e' plantada no cursor, nao no jogador.
        const index = NEW_PROJECTILE(null, Main.MouseWorld, Vector2.Zero, sentryType, damage, knockBack, player.whoAmI, 0, 0, 0, null);
        const proj = Main.projectile[index];
        if (proj) proj.originalDamage = item.damage;

        player.UpdateMaxTurrets();
        return false;
    }
}
