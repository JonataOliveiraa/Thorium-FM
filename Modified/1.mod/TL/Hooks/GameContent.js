import { Terraria, Modules } from './../ModImports.js';
import { NPCHooks } from './NPC.js';
import { CombinedLoader } from './../Loaders/CombinedLoader.js';
import { ItemLoader } from './../Loaders/ItemLoader.js';
import { NPCLoader } from './../Loaders/NPCLoader.js';
import { HairLoader } from './../Loaders/HairLoader.js';
import { EmoteBubbleLoader } from './../Loaders/EmoteBubbleLoader.js';
import { NPCHappiness } from './../NPCHappiness.js';
import { PlayerDB } from './../PlayerDB.js';

const { Color, Rand, Rectangle, Vector2 } = Modules;
const { SpriteEffects } = Modules.Effects;

const NewItem = Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay)'];

export class GameContentHooks {
    static initialized = false;
    
    // Here you can disable the hooks that won't be used in your mod to avoid unnecessary processing
    static HookList = {
        All: (info) => true,
        Hairs: (info) => info.hasHairs,
        NotifyItemCraft: (info) => info.hasItems || info.hasGlobalItems || info.hasPlayers || info.hasAchievements,
        DropItemFromNPC: (info) => info.hasItems || info.hasNPCs || info.hasGlobalNPCs,
        GetShoppingSettings: (info) => info.hasNPCs || info.hasGlobalNPCs,
        TownRoomManager: (info) => info.hasNPCs,
        Emotes: (info) => info.hasEmotes
    };
    
    static Initialize(info) {
        if (!this.HookList.All(info) || this.initialized) return;
        
        if (this.HookList.Hairs(info)) {
            const GUIPlayerCreateMenu = new NativeClass('', 'GUIPlayerCreateMenu');
            GUIPlayerCreateMenu['void CreateAndSave()'
            ].hook((original, self) => {
                const player = Terraria.Main.PendingPlayer;
                const db = new PlayerDB(Terraria.Main['string GetPlayerPathFromName(string playerName, bool cloudSave)'](player.name, false) + '.bin');
                db.Load();
                db.set('modsystem:hair', player.hair);
                db.Save();
                original(self);
            });
            
            Terraria.Main['void LoadPlayers(bool canFullRefresh)'
            ].hook((original, self, canFullRefresh) => {
                original(self, canFullRefresh);
                const list = Terraria.Main.PlayerList;
                const count = list.Count;
                for (let i = 0; i < count; i++) {
                    const plr = list.get_Item(i);
                    const db = new PlayerDB(plr.Path + '.bin');
                    db.Load();
                    const hair = parseInt(db.get('modsystem:hair'));
                    if (hair || hair === 0) plr.Player.hair = hair;
                }
            });
            
            Terraria.GameContent.HairstyleUnlocksHelper['bool ListWarrantsRemake()'
            ].hook((original, self) => {
                let flag = original(self);
                for (const hair of HairLoader.Hairs) {
                    hair._oldIsUnlocked = hair.isUnlocked;
                    hair._isUnlocked = hair.IsUnlocked(self._isAtCharacterCreation, self._isAtStylist) ?? false;
                    if (hair._oldIsUnlocked !== hair._isUnlocked) {
                        flag = true;
                    }
                }
                return flag;
            });
            
            Terraria.GameContent.HairstyleUnlocksHelper['void RebuildList()'
            ].hook((original, self) => {
                original(self);
                const list = self.AvailableHairstyles;
                for (const hair of HairLoader.Hairs) {
                    if (hair.Type >= HairLoader.MAX_VANILLA_ID) {
                        if (hair._isUnlocked) list.Add(hair.Type);
                    }
                }
            });
        }
        
        if (this.HookList.NotifyItemCraft(info)) {
            Terraria.GameContent.Achievements.AchievementsHelper['void NotifyItemCraft(Recipe recipe)'
            ].hook((original, recipe) => {
                original(recipe);
                CombinedLoader.OnCraft(recipe.createItem, Terraria.Main.player[Terraria.Main.myPlayer], recipe);
            });
        }
        
        if (this.HookList.DropItemFromNPC(info)) {
            Terraria.GameContent.ItemDropRules.CommonCode['void DropItemFromNPC(NPC npc, int itemId, int stack, bool scattered)'
            ].hook((original, npc, itemId, stack, scattered) => {
                if (!ItemLoader.isModType(itemId)) {
                    original(npc, itemId, stack, scattered);
                    return;
                }
                
                let X = Math.floor(npc.position.X + npc.width / 2);
                let Y = Math.floor(npc.position.Y + npc.height / 2);
                
                if (scattered) {
                    X = Math.floor(npc.position.X + Rand.Next(npc.width + 1));
                    Y = Math.floor(npc.position.Y + Rand.Next(npc.height + 1));
                }
                
                let itemIndex = NewItem(X, Y, 0, 0, itemId, stack, false, -1, false);
                
                NPCLoader.ModifyItemDropFromNPC(npc, itemIndex);
            });
            
            Terraria.GameContent.ItemDropRules.CommonCode['void DropItemLocalPerClientAndSetNPCMoneyTo0(NPC npc, int itemId, int stack, bool interactionRequired)'
            ].hook((original, npc, itemId, stack, interactionRequired) => {
                if (!ItemLoader.isModType(itemId)) {
                    original(npc, itemId, stack, interactionRequired);
                    return;
                }
                
                if (Terraria.Main.netMode === 2) {
                    let itemSlot = NewItem(npc.position.X, npc.position.Y, npc.width, npc.height, itemId, stack, true, -1, false);
                    Terraria.Main.timeItemSlotCannotBeReusedFor[itemSlot] = 54000;
                    for (let rc = 0; rc < 255; rc++) {
                        if (Terraria.Main.player[rc].active && (npc.playerInteraction[rc] || !interactionRequired)) {
                            Terraria.NetMessage.SendData(90, rc, -1, null, itemSlot, 0, 0, 0, 0, 0, 0);
                        }
                        Terraria.Main.item[itemSlot].active = false;
                    }
                } else {
                    Terraria.GameContent.ItemDropRules.CommonCode.DropItemFromNPC(npc, itemId, stack, false);
                }
                
                npc.value = 0.0;
            });
        }
        
        if (this.HookList.GetShoppingSettings(info)) {
            Terraria.GameContent.ShopHelper['ShoppingSettings GetShoppingSettings(Player player, NPC npc)'
            ].hook((original, self, player, npc) => {
                const shoppingSettings = Terraria.ShoppingSettings.new();
                shoppingSettings.PriceAdjustment = 1.0;
                shoppingSettings.HappinessReport = '';
                
                self._currentNPCBeingTalkedTo = npc;
                self._currentPlayerTalking = player;
                
                self.ProcessMood(player, npc);
                
                shoppingSettings.PriceAdjustment = self._currentPriceAdjustment;
                shoppingSettings.HappinessReport = self._currentHappiness;
                
                return shoppingSettings;
            });
            
            const List = new NativeClass('System.Collections.Generic', 'List`1');
            const NPCType = new NativeClass('Terraria', 'NPC');
            Terraria.GameContent.ShopHelper['void ProcessMood(Player player, NPC npc)'
            ].hook((original, self, player, npc) => {
                self._currentHappiness = '';
                self._currentPriceAdjustment = 1.0;
                if (npc.loveStruck) {
                    self._currentPriceAdjustment *= 0.9;
                }
                if (npc.type == 368) {
                    self._currentPriceAdjustment = 1.0;
                } else if (npc.type == 453) {
                    self._currentPriceAdjustment = 1.0;
                } else {
                    if (npc.type == 656 || npc.type == 637 || npc.type == 638) return;
                    if (self.IsNotReallyTownNPC(npc)) {
                        self._currentPriceAdjustment = 1.0;
                    } else {
                        const isModType = NPCLoader.isModType(npc.type);
                        if (isModType) {
                            if (npc.homeless) {
                                NPCHappiness.AddHappinessReportText(self, 'NoHome');
                                self._currentPriceAdjustment = 1000;
                            } else {
                                if (Vector2.Distance(Vector2.new(npc.homeTileX, npc.homeTileY), Vector2.new(npc.Center.X / 16, npc.Center.Y / 16)) > 120.0) {
                                    NPCHappiness.AddHappinessReportText('FarFromHome');
                                    self._currentPriceAdjustment = 1000;
                                }
                            }
                            let isInEvilBiome = false;
                            if (player.ZoneCorrupt) {
                                NPCHappiness.AddHappinessReportText(self, 'HateBiome', Terraria.GameContent.ShopHelper.BiomeNameByKey('Corruption'))
                                isInEvilBiome = true;
                            } else if (player.ZoneCrimson) {
                                NPCHappiness.AddHappinessReportText(self, 'HateBiome', Terraria.GameContent.ShopHelper.BiomeNameByKey('Crimson'))
                                isInEvilBiome = true;
                            } else if (player.ZoneDungeon) {
                                NPCHappiness.AddHappinessReportText(self, 'HateBiome', Terraria.GameContent.ShopHelper.BiomeNameByKey('Dungeon'))
                                isInEvilBiome = true;
                            }
                            if (isInEvilBiome) {
                                self._currentPriceAdjustment = 1000;
                            }
                        } else {
                            if (self.RuinMoodIfHomeless(npc)) {
                                self._currentPriceAdjustment = 1000;
                            } else if (self.IsFarFromHome(npc)) {
                                self._currentPriceAdjustment = 1000;
                            }
                            if (self.IsPlayerInEvilBiomes(player)) {
                                self._currentPriceAdjustment = 1000;
                            }
                        }
                        
                        let npcsWithinHouse = 0;
                        let npcsWithinVillage = 0;
                        
                        function GetNearbyResidentNPCs(npc) {
                            const NpcList = List.makeGeneric(NPCType);
                            const list = NpcList.new();
                            list['void .ctor()']();
                            let vector2_1 = Vector2.new(npc.homeTileX, npc.homeTileY);
                            if (npc.homeless) {
                                vector2_1 = Vector2.new(npc.Center.X / 16, npc.Center.Y / 16);
                            }
                            for (let index = 0; index < 200; ++index) {
                                if (index != npc.whoAmI) {
                                    let npc1 = Terraria.Main.npc[index];
                                    if (npc1.active && npc1.townNPC && !self.IsNotReallyTownNPC(npc1) && !Terraria.WorldGen.TownManager.CanNPCsLiveWithEachOther_ShopHelper(npc, npc1)) {
                                        let vector2_2 = Vector2.new(npc1.homeTileX, npc1.homeTileY);
                                        if (npc1.homeless) {
                                            vector2_2 = Vector2.new(npc1.Center.X / 16, npc1.Center.Y / 16);
                                        }
                                        let num = Vector2.Distance(vector2_1, vector2_2);
                                        if (num < 25.0) {
                                            list.Add(npc1);
                                            ++npcsWithinHouse;
                                        } else if (num < 120.0) {
                                            ++npcsWithinVillage;
                                        }
                                    }
                                }
                            }
                            return list;
                        }
                        
                        let nearbyResidentNpcs = GetNearbyResidentNPCs(npc);
                        
                        if (npcsWithinHouse > 2) {
                            for (let index = 2; index < npcsWithinHouse + 1; ++index) {
                                self._currentPriceAdjustment *= 1.04;
                            }
                            if (npcsWithinHouse > 4) {
                                if (isModType) {
                                    NPCHappiness.AddHappinessReportText(self, 'HateCrowded');
                                } else {
                                    self.AddHappinessReportText('HateCrowded', null);
                                }
                            } else {
                                if (isModType) {
                                    NPCHappiness.AddHappinessReportText(self, 'DislikeCrowded');
                                } else {
                                    self.AddHappinessReportText('DislikeCrowded', null);
                                }
                            }
                        }
                        
                        if (npcsWithinHouse < 2 && npcsWithinVillage < 4) {
                            if (isModType) {
                                NPCHappiness.AddHappinessReportText(self, 'LoveSpace');
                            } else {
                                self.AddHappinessReportText('LoveSpace', null);
                            }
                            self._currentPriceAdjustment *= 0.9;
                        }
                        
                        let flagArray = Array(NPCLoader.NPCCount).fill(false).makeGeneric('bool');
                        let npcListArray = Array.from(nearbyResidentNpcs.ToArray());
                        for (const _npc of npcListArray) {
                            let _type = NPCHooks.realTypes[_npc.whoAmI] ?? _npc.type;
                            flagArray[_type] = true;
                        }
                        
                        const info = Terraria.GameContent.Personalities.HelperInfo.new();
                        info.player = player;
                        info.npc = npc;
                        info.NearbyNPCs = nearbyResidentNpcs;
                        info.nearbyNPCsByType = flagArray;
                        
                        const PrimaryPlayerBiome = player.ZoneDungeon ? 8
                        : player.ZoneCorrupt ? 9
                        : player.ZoneCrimson ? 10
                        : player.ZoneGlowshroom ? 7
                        : player.ZoneHallow ? 6
                        : player.ZoneJungle ? 4
                        : player.ZoneSnow ? 2
                        : player.ZoneBeach ? 5
                        : player.ZoneDesert ? 3
                        : player.position.Y > Terraria.Main.worldSurface * 16.0 ? 1 : 0;
                        
                        if (!isModType) Terraria.GameContent.Personalities.AllPersonalitiesModifier.new().ModifyShopPrice(info, self);
                        else NPCHappiness.ModifyShopPrice(info, PrimaryPlayerBiome, self);
                        
                        NPCLoader.ModifyNPCHappiness(npc, player, PrimaryPlayerBiome, self, flagArray);
                        
                        if (self._currentHappiness == '') {
                            if (isModType) {
                                NPCHappiness.AddHappinessReportText(self, 'Content');
                            } else {
                                self.AddHappinessReportText('Content', null);
                            }
                        }
                        
                        self._currentPriceAdjustment = self.LimitAndRoundMultiplier(self._currentPriceAdjustment);
                    }
                }
            });
        }
        
        if (this.HookList.TownRoomManager(info)) {
            Terraria.GameContent.TownRoomManager['void Load(BinaryReader reader)'
            ].hook((original, self, reader) => {
                Terraria.Main.townNPCCanSpawn = Terraria.Main.townNPCCanSpawn.cloneResized(NPCLoader.NPCCount);
                Terraria.WorldGen.TownManager._hasRoom = Terraria.WorldGen.TownManager._hasRoom.cloneResized(NPCLoader.NPCCount);
                original(self, reader);
            });
        }
        
        if (this.HookList.Emotes(info)) {
            const GUIEmotesWindow = new NativeClass('', 'GUIEmotesWindow');
            
            GUIEmotesWindow.GetEmotesGeneral.hook((original, self, list) => {
                original(self, list);
                EmoteBubbleLoader.AddToCategory(Terraria.Enums.EmoteBubbleCategory.General, list);
            });
            GUIEmotesWindow.GetEmotesRPS.hook((original, self, list) => {
                original(self, list);
                EmoteBubbleLoader.AddToCategory(Terraria.Enums.EmoteBubbleCategory.Rps, list);
            });
            GUIEmotesWindow.GetEmotesItems.hook((original, self, list) => {
                original(self, list);
                EmoteBubbleLoader.AddToCategory(Terraria.Enums.EmoteBubbleCategory.Items, list);
            });
            GUIEmotesWindow.GetEmotesBiomesAndEvents.hook((original, self, list) => {
                original(self, list);
                EmoteBubbleLoader.AddToCategory(Terraria.Enums.EmoteBubbleCategory.BiomesAndEvents, list);
            });
            GUIEmotesWindow.GetEmotesTownNPCs.hook((original, self, list) => {
                original(self, list);
                EmoteBubbleLoader.AddToCategory(Terraria.Enums.EmoteBubbleCategory.Town, list);
            });
            GUIEmotesWindow.GetEmotesCritters.hook((original, self, list) => {
                original(self, list);
                EmoteBubbleLoader.AddToCategory(Terraria.Enums.EmoteBubbleCategory.CrittersAndMonsters, list);
            });
            GUIEmotesWindow.GetEmotesBosses.hook((original, self, list) => {
                original(self, list);
                EmoteBubbleLoader.AddToCategory(Terraria.Enums.EmoteBubbleCategory.Dangers, list);
            });
            
            GUIEmotesWindow.GetFrame.hook((original, self, emote) => {
                if (EmoteBubbleLoader.OriginalEmoteTexture !== null) {
                    self._emoteTexture.Value = EmoteBubbleLoader.OriginalEmoteTexture;
                    EmoteBubbleLoader.OriginalEmoteTexture = null;
                }
                const frame = original(self, emote);
                if (EmoteBubbleLoader.isModType(emote)) {
                    const modEmote = EmoteBubbleLoader.getModEmote(emote);
                    EmoteBubbleLoader.OriginalEmoteTexture = self._emoteTexture.Value;
                    self._emoteTexture.Value = modEmote._texture.Value;
                    frame.X = (frame.X % 68) === 0 ? 0 : 34; frame.Y = 28;
                    frame.Width = 34; frame.Height = 28;
                }
                return frame;
            });
            
            const { EmoteBubble } = Terraria.GameContent.UI;
            EmoteBubble['int NewBubble(int emoticon, WorldUIAnchor bubbleAnchor, int time)'
            ].hook((original, emote, anchor, time) => {
                const id = original(emote, anchor, time);
                if (EmoteBubbleLoader.isModType(emote)) {
                    EmoteBubbleLoader.getModEmote(emote).OnSpawn(EmoteBubble.byID.get_Item(id));
                }
                return id;
            });
            EmoteBubble['int NewBubbleNPC(WorldUIAnchor bubbleAnchor, int time, WorldUIAnchor other)'
            ].hook((original, anchor, time, anchorOther) => {
                const id = original(anchor, time, anchorOther);
                const bubble = EmoteBubble.byID.get_Item(id);
                if (EmoteBubbleLoader.isModType(bubble.emote)) {
                    EmoteBubbleLoader.getModEmote(bubble.emote).OnSpawn(bubble);
                }
                return id;
            });
            
            EmoteBubble.PickNPCEmote.hook((original, self, anchor) => {
                original(self, anchor);
                if (Rand.Next(5) === 0) {
                    const unlocked = EmoteBubbleLoader.EmoteBubbles.filter(e => e.IsUnlocked());
                    if (unlocked.length > 0) {
                        const emote = unlocked[Math.floor(Math.random() * unlocked.length)];
                        if (emote && Rand.Next(2) === 0) self.emote = emote.Type;
                    }
                }
            });
            
            EmoteBubble['void Draw(SpriteBatch sb)'
            ].hook((original, self, spriteBatch) => {
                if (EmoteBubbleLoader.OriginalEmoteTexture !== null) {
                    Terraria.GameContent.TextureAssets.Extra[48].Value = EmoteBubbleLoader.OriginalEmoteTexture;
                    EmoteBubbleLoader.OriginalEmoteTexture = null;
                }
                
                if (!EmoteBubbleLoader.isModType(self.emote)) {
                    original(self, spriteBatch);
                    return;
                }
                
                const Draw = spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'];
                const modEmote = EmoteBubbleLoader.getModEmote(self.emote);
                
                let texture2D = Terraria.GameContent.TextureAssets.Extra[48].Value;
                let effect = SpriteEffects.None;
                if (self.anchor.type.value__ === Terraria.GameContent.UI.WorldUIAnchor.AnchorType.Entity.value__) {
                    effect = self.anchor.entity.direction === -1 ? SpriteEffects.None : SpriteEffects.FlipHorizontally;
                }
                let vector2 = Terraria.Utils['Vector2 Floor(Vector2 vec)'](self.GetPosition(null));
                let flag = self.lifeTime < 6 || self.lifeTimeStart - self.lifeTime < 6;
                const rectangle = Rectangle.new(flag ? 0 : 34, 0, 34, 28);
                const origin = Vector2.new(rectangle.Width / 2, rectangle.Height);
                if (Terraria.Main.player[Terraria.Main.myPlayer].gravDir === -1) {
                    origin.Y = 0;
                    effect.value__ |= SpriteEffects.FlipVertically.value__;
                    vector2 = Terraria.Main['Vector2 ReverseGravitySupport(Vector2 pos, float height)'](vector2, 0);
                }
                const emoteTexture = modEmote._texture.Value;
                const emoteFrame = modEmote.GetFrame(self, Rectangle.new(self.frame * 34, 28, 34, 28));
                if (EmoteBubbleLoader.PreDraw(self, spriteBatch, emoteTexture, vector2, emoteFrame, origin, effect) === false) {
                    EmoteBubbleLoader.PostDraw(self, spriteBatch, emoteTexture, vector2, emoteFrame, origin, effect);
                    return;
                }
                Draw(texture2D, vector2, rectangle, Color.White, 0.0, origin, 1, effect, 0.0);
                if (!flag) {
                    if (self.emote >= 0) {
                        Draw(emoteTexture, vector2, emoteFrame, Color.White, 0.0, origin, 1, effect, 0.0);
                    }
                }
                EmoteBubbleLoader.PostDraw(self, spriteBatch, emoteTexture, vector2, emoteFrame, origin, effect)
            });
        }
        
        this.initialized = true;
    }
}