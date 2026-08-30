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

export class RedHag extends ModHag {
    constructor() {
        super();
        this.Texture = 'NPCs/Hag/' + this.constructor.name;
        this.TeleportDust = 6;
        this.AttackDust = 6;
        this.DeathDustAlpha = 150;
        this.AttackSound = Terraria.ID.SoundID.Item42;
        this.LightR = 0.3;
        this.LightG = 0.1;
        this.LightB = 0.1;
        this._proType = -1;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.TheUnderworld);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.RedHag');
        bestiaryEntry.Info.Add(FlavorText);
    }

    SpawnChance(info) {
        if (!info.CommonEnemy || info.PlayerSafe || !info.Underworld) return 0;
        if (!Terraria.NPC.downedBoss2 || !Main.hardMode) return 0;
        return 0.0035;
    }

    HagShoot(npc, player) {
        if (this._proType === -1) this._proType = ModProjectile.getTypeByName('FieryTotemHostilePro') ?? -2;
        if (this._proType <= 0) return;

        const center = npc.Center;
        const target = player.Center;
        const dx = target.X - center.X;
        const dy = target.Y - center.Y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        NewProjectile(null, center, Vector2.new(dx / len * 14, dy / len * 14), this._proType, 25, 0, Main.myPlayer, 0, 0, 0, null);
    }

    ModifyNPCLoot(npcLoot) {
        const notExpert = Conditions.NotExpert ? Conditions.NotExpert.new() : null;
        const isExpert = Conditions.IsExpert ? Conditions.IsExpert.new() : null;

        {
            if (notExpert && isExpert) {
                npcLoot.Add(ItemDropRule.ByCondition(notExpert, 173, 1, 3, 5, 1));
                npcLoot.Add(ItemDropRule.ByCondition(isExpert, 173, 1, 5, 10, 1));
            } else {
                npcLoot.Add(ItemDropRule.Common(173, 1, 3, 5));
            }
        }
        {
            if (notExpert && isExpert) {
                npcLoot.Add(ItemDropRule.ByCondition(notExpert, 174, 3, 3, 5, 1));
                npcLoot.Add(ItemDropRule.ByCondition(isExpert, 174, 3, 4, 6, 1));
            } else {
                npcLoot.Add(ItemDropRule.Common(174, 3, 3, 5));
            }
        }
    }
}
