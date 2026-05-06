import { Terraria, Microsoft, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModBuff } from "./../../../TL/ModBuff.js";
import { ModProjectile } from "./../../../TL/ModProjectile.js";

const Projectile = new NativeClass("Terraria", "Projectile");
const NewProjectile2 = Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];


export class ThunderTalon extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/ThunderBird/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.melee = true;

        // (damage, knockback, crit);
        this.SetWeaponValues(22, 6, 4);
        // (useTime, autoReuse);
        this.SetDefaultWeaponStyle(22, true);

        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }

    OnHitNPC(item, player, npc, damageDone, knockBack) {

        if (!npc || typeof npc.whoAmI === 'undefined') return;


        let velVec = Microsoft.Xna.Framework.Vector2.new();
        velVec.X = 0; velVec.Y = -5;

        let damage = 12;

        let zapType = ModProjectile.getTypeByName("ThunderZap");

        NewProjectile2(
            Projectile.GetNoneSource(),
            npc.Center, velVec,
            zapType, Math.floor(damage * 0.6), 0, player.whoAmI,
            npc.whoAmI, 0, 0, null);
    }
}