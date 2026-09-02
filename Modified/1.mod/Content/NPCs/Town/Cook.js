import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ShopIcon } from './../../UI/ShopIcon.js';
import { ModNPC } from './../../../TL/ModNPC.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';
import { NPCHappiness, AffectionLevel } from './../../../TL/NPCHappiness.js';
import { WorldDB } from '../../../TL/WorldDB.js';
import { CookRecipes, COOK_RECIPES } from './CookRecipes.js';

const { SoundID, ItemID, NPCID } = Terraria.ID;
const {
  BestiaryDatabaseNPCsPopulator,
  FlavorTextBestiaryInfoElement
} = Terraria.GameContent.Bestiary;

const COOK_NAMES = [
  "Alain", "Alexis", "Alfredo", "Alton", "Antoine",
  "Auguste", "Emeril", "Éric", "Fernand", "Flay",
  "Gordan", "Guillaume", "Guy", "Jacques", "Jamie",
  "Joel", "Linguini", "Philip", "Thomas", "Wolfgang"
];

const CHAT_KEYS = ['Cook_1', 'Cook_2', 'Cook_3', 'Cook_4', 'Cook_5'];

export class Cook extends ModNPC {
  constructor() {
    super();
    this.Texture = "NPCs/Town/Cook/" + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.Main.npcFrameCount[this.Type] = 25;
    NPCID.Sets.ExtraFramesCount[this.Type] = 9;
    NPCID.Sets.AttackFrameCount[this.Type] = 4;
    NPCID.Sets.DangerDetectRange[this.Type] = 700;
    NPCID.Sets.AttackType[this.Type] = 0;
    NPCID.Sets.AttackTime[this.Type] = 10;
    NPCID.Sets.AttackAverageChance[this.Type] = 30;
    NPCID.Sets.HatOffsetY[this.Type] = 4;
    NPCID.Sets.ShimmerTownTransform[this.Type] = false;

    NPCID.Sets.NPCBestiaryDrawOffset.Add(
      this.Type,
      NPCID.Sets.NPCBestiaryDrawOffset.get_Item(NPCID.Guide)
    );

    this.BestiaryRarityStars = 3;

    new NPCHappiness(this.Type)
      .SetBiomeAffection(Terraria.ID.BiomeID.Mushroom, AffectionLevel.Like)
      .SetBiomeAffection(Terraria.ID.BiomeID.NormalUnderground, AffectionLevel.Dislike)
      .SetNPCAffection(142, AffectionLevel.Love)    // Santa Claus
      .SetNPCAffection(160, AffectionLevel.Like)    // Truffle
      .SetNPCAffection(633, AffectionLevel.Like)    // Princess
      .SetNPCAffection(369, AffectionLevel.Dislike) // Angler
      .SetNPCAffection(209, AffectionLevel.Hate);   // Cyborg
  }

  SetDefaults() {
    this.NPC.townNPC = true;
    this.NPC.friendly = true;
    this.NPC.width = 18;
    this.NPC.height = 40;
    this.NPC.aiStyle = 7;
    this.NPC.damage = 10;
    this.NPC.defense = 15;
    this.NPC.lifeMax = 250;
    this.NPC.HitSound = SoundID.NPCHit1;
    this.NPC.DeathSound = SoundID.NPCDeath1;
    this.NPC.knockBackResist = 0.5;
    this.AnimationType = 22;
  }

  SetBestiary(database, bestiaryEntry) {
    bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.SurfaceMushroom);

    const FlavorText = FlavorTextBestiaryInfoElement.new();
    FlavorText._key = ModLocalization.Translate("Bestiary.Cook");
    bestiaryEntry.Info.Add(FlavorText);
  }

  SetNPCNameList() {
    return COOK_NAMES;
  }

  CanTownNPCSpawn() {
    return Terraria.NPC.downedSlimeKing;
  }

  GetChat(npc) {
    const anglerIndex = Terraria.NPC.FindFirstNPC(369);
    const dryadIndex = Terraria.NPC.FindFirstNPC(20);
    const witchDoctorIndex = Terraria.NPC.FindFirstNPC(228);

    if (anglerIndex >= 0 && Math.random() < 0.16) {
      return this._say('Cook_Angler', Terraria.Main.npc[anglerIndex].GivenName);
    }
    if (dryadIndex >= 0 && Math.random() < 0.14) {
      return this._say('Cook_Dryad', Terraria.Main.npc[dryadIndex].GivenName);
    }
    if (witchDoctorIndex >= 0 && Math.random() < 0.12) {
      return this._say('Cook_WitchDoctor', Terraria.Main.npc[witchDoctorIndex].GivenName);
    }

    return this._say(CHAT_KEYS[Math.floor(Math.random() * CHAT_KEYS.length)]);
  }

  _say(key, name) {
    const message = ModLocalization.Translate(`NPCChat.${key}`);
    return name && message.includes('{0}') ? message.replace('{0}', name) : message;
  }

  SetChatButtons(npc, player, button1, button2) {
    button1.text = Terraria.Localization.Language.GetText('LegacyInterface.28').Value;
    button1.texture = ShopIcon.Texture();
    button1.cost = 0;

    button2.text = ModLocalization.Translate('NPCChat.Cook_CookIngredients');
    button2.texture = null;
  }

  Option1Clicked(npc, player) {
    this.OpenShop(npc, player);
  }

  // Botao "cozinhar": consome UM ingrediente por clique, como no original. Quando
  // o total acumulado atinge a receita, ele entrega as amostras e passa a vender.
  Option2Clicked(npc, player) {
    const pending = [];

    for (const recipe of COOK_RECIPES) {
      if (!CookRecipes.IsAvailable(recipe) || CookRecipes.IsUnlocked(recipe)) continue;
      pending.push(recipe);

      const ingredientType = CookRecipes.IngredientType(recipe);
      if (!this._takeOne(player, ingredientType)) continue;

      const total = CookRecipes.AddDonation(recipe, 1);

      if (total < recipe.required) {
        Terraria.Main.npcChatText = this._say('Cook_Donated')
          .replace('{0}', String(recipe.required - total))
          .replace('{1}', this._itemTag(ingredientType));
        return;
      }

      this._giveSamples(player, CookRecipes.ResultType(recipe), recipe.samples);
      Terraria.Main.npcChatText = this._say('Cook_RecipeUnlocked')
        .replace('{0}', this._itemTag(CookRecipes.ResultType(recipe)));
      return;
    }

    Terraria.Main.npcChatText = pending.length > 0
      ? this._say('Cook_NoIngredients').replace('{0}', this._wishlist(pending))
      : this._say('Cook_NothingLeft');
  }

  _itemTag(itemType) {
    if (!(itemType > 0)) return '';
    if (!ModItem.isModType(itemType)) return `[i:${itemType}]`;

    const modItem = ModItem.getModItem(itemType);
    if (!modItem) return '';

    return ModLocalization.Translate(`ItemName.${modItem.constructor.name}`);
  }

  // Lista o que ainda falta para cada receita pendente, ja' descontando o doado.
  _wishlist(recipes) {
    const parts = [];
    for (const recipe of recipes) {
      const missing = recipe.required - CookRecipes.Donated(recipe);
      if (missing <= 0) continue;
      parts.push(`${missing}x ${this._itemTag(CookRecipes.IngredientType(recipe))}`);
    }
    return parts.join(', ');
  }

  _takeOne(player, itemType) {
    if (itemType <= 0) return false;

    for (let index = 0; index < player.inventory.length; index++) {
      const item = player.inventory[index];
      if (!item || item.type !== itemType || item.stack <= 0) continue;

      item.stack--;
      if (item.stack <= 0) item.TurnToAir(false);
      return true;
    }

    return false;
  }

  _giveSamples(player, itemType, amount) {
    if (itemType <= 0 || amount <= 0) return;
    const QuickSpawnItem = player['void QuickSpawnItem(IEntitySource source, int item, int stack)'];
    for (let index = 0; index < amount; index++) {
      QuickSpawnItem(null, itemType, 1);
    }
  }

  // getTypeByName devolve `undefined` para item inexistente (getByName(name)?.Type),
  // e varios itens da loja original ainda nao foram criados. Sem este filtro o
  // AddRange recebia `undefined` toda vez que o jogador abria a loja.
  _stock(npcShop, names) {
    const types = [];
    for (const name of names) {
      const type = Number(ModItem.getTypeByName(name) ?? 0);
      if (type > 0) types.push(type);
    }
    if (types.length > 0) npcShop.AddRange(types);
  }

  SetupShop(npc, player, npcShop) {
    npcShop.Clear();

    this._stock(npcShop, [
      'CherryPie', 'StackofPancakes', 'IceCreamCone',
      'HamandCheeseMelt', 'CarrotCookie', 'ToughNutToffee',
      'CooksHat', 'CooksApron'
    ]);

    if (Terraria.NPC.downedBoss1) {
      this._stock(npcShop, ['Fork', 'Spoon', 'Knife', 'SpudBomber', 'Spud', 'PotionChaser']);
    }

    if (Terraria.NPC.downedBoss2) {
      this._stock(npcShop, ['LargePopcorn', 'JarOMayo']);
    }

    if (Terraria.Main.hardMode) {
      this._stock(npcShop, ['FlanPlatter']);
    }

    if (Terraria.Main.eclipse) {
      this._stock(npcShop, ['FreshPickle']);
    } else if (Terraria.Main.bloodMoon) {
      this._stock(npcShop, ['AromaticBiscuit']);
    } else {
      this._stock(npcShop, ['SweetBeet']);
    }

    if (Terraria.NPC.downedChristmasIceQueen || Terraria.NPC.downedChristmasSantank) {
      this._stock(npcShop, [Terraria.Main.dayTime ? 'SugarCookieBlock' : 'GingerbreadBlock']);
    }

    // Receitas ja' destravadas por doacao entram no estoque permanente.
    const unlocked = CookRecipes.UnlockedResults();
    if (unlocked.length > 0) npcShop.AddRange(unlocked);
  }

  HitEffect(npc, hitDirection, damage) {
    if (Terraria.Main.netMode > 0) return;
    const numDust = npc.life > 0 ? 5 : 15;
    for (let k = 0; k < numDust; k++) {
      Modules.Effects.NewDustFromNPC(npc, Terraria.ID.DustID.Blood);
    }
  }

  CanGoToStatue(npc, toKingStatue) {
    return toKingStatue;
  }
}
