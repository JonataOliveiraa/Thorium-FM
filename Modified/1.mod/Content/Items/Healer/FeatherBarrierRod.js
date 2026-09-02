import { ModHealerItem } from '../../../Common/ModHealerItem.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ArcaneArmorFabricator } from '../../Global/Tiles/ArcaneArmorFabricator.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

const FEATHERS = 5;

let _barrierType = -1;
let _featherProType = -1;

export class FeatherBarrierRod extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.SetWeaponValues(16, 6, 6);
        this.Item.mana = 15;
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item24;
        this.Item.shootSpeed = 12;

        if (_featherProType === -1) _featherProType = ModProjectile.getTypeByName('FeatherBarrierPro') ?? -2;
        if (_featherProType >= 0) this.Item.shoot = _featherProType;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        this.RefreshBarrier(player, damage, knockBack);
        return true;
    }

    RefreshBarrier(player, damage, knockBack) {
        if (_barrierType === -1) _barrierType = ModProjectile.getTypeByName('FeatherBarrier') ?? -2;
        if (_barrierType < 0) return;

        for (let i = 0; i < Main.maxProjectiles; i++) {
            const old = Main.projectile[i];
            if (old && old.active && old.owner === player.whoAmI && old.type === _barrierType) old.Kill();
        }

        const center = player.Center;

        for (let i = 0; i < FEATHERS; i++) {
            NewProjectile(
                null, center, Vector2.Zero,
                _barrierType, damage, knockBack, player.whoAmI,
                i, 0, 0, null
            );
        }

        PlaySound(Terraria.ID.SoundID.Item25, center, 0, 1);
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Feather, 8)
            .AddTile(ArcaneArmorFabricator.Type)
            .Register();
    }
}
