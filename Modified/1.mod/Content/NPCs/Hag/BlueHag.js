import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModHag } from '../../../Common/ModHag.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';

const { Vector2 } = Modules;
const { Main } = Terraria;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule, Conditions } = Terraria.GameContent.ItemDropRules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class BlueHag extends ModHag {
    constructor() {
        super();
        this.Texture = 'NPCs/Hag/' + this.constructor.name;
        this.TeleportDust = 113;
        this.AttackDust = 29;
        this.DeathDustAlpha = 0;
        this.AttackSound = Terraria.ID.SoundID.Item43;
        this.LightR = 0.1;
        this.LightG = 0.1;
        this.LightB = 0.3;
        this._proType = -1;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Ocean);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.BlueHag');
        bestiaryEntry.Info.Add(FlavorText);
    }

    SpawnChance(info) {
        if (!info.CommonEnemy || info.PlayerSafe || !info.Ocean) return 0;
        if (!Terraria.NPC.downedBoss2) return 0;
        return 0.0035;
    }

    HagShoot(npc, player) {
        if (this._proType === -1) this._proType = ModProjectile.getTypeByName('HagGlobule') ?? -2;
        if (this._proType <= 0) return;

        const target = player.Center;
        NewProjectile(null, Vector2.new(target.X, target.Y - 30), Vector2.new(0, -0.35), this._proType, 25, 0, Main.myPlayer, 0, 0, 0, null);
    }

    ModifyNPCLoot(npcLoot) {
        const notExpert = Conditions.NotExpert ? Conditions.NotExpert.new() : null;
        const isExpert = Conditions.IsExpert ? Conditions.IsExpert.new() : null;
        const aquaite = ModItem.getTypeByName('AquaiteOre') ?? 0;

        {
            if (notExpert && isExpert) {
                npcLoot.Add(ItemDropRule.ByCondition(notExpert, 275, 1, 2, 4, 1));
                npcLoot.Add(ItemDropRule.ByCondition(isExpert, 275, 1, 4, 8, 1));
            } else {
                npcLoot.Add(ItemDropRule.Common(275, 1, 2, 4));
            }
        }
        if (aquaite > 0) {
            if (notExpert && isExpert) {
                npcLoot.Add(ItemDropRule.ByCondition(notExpert, aquaite, 3, 2, 5, 1));
                npcLoot.Add(ItemDropRule.ByCondition(isExpert, aquaite, 3, 5, 10, 1));
            } else {
                npcLoot.Add(ItemDropRule.Common(aquaite, 3, 2, 5));
            }
        }
    }
}
