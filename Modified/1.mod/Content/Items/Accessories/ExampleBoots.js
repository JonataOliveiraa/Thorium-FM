import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class ExampleBoots extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Accessories/' + this.constructor.name;
        this.MoveSpeedBonus = 8;
        this.LavaImmunityTime = 2; // seconds
    }
    
    SetDefaults() {
        this.Item.accessory = true;
        this.Item.rare = Terraria.ID.ItemRarityID.Red;
        this.Item.value = Terraria.Item.sellPrice(0, 2, 0, 0);
    }
    
    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            if (line.includes('{0}')) {
                this.TooltipLines[i] = line.replace('{0}', this.LavaImmunityTime);
            }
        }
    }
    
    UpdateAccessory(item, player, vanity, hideVisual) {
        if (!vanity) {
            // Modifies the player movement speed bonus.
            player.moveSpeed += this.MoveSpeedBonus / 100;
            // Sets the players sprint speed in boots.
            player.accRunSpeed = 6.75;
            
            // Determines whether the boots count as rocket boots
            // 0 - These are not rocket boots
            player.rocketBoots = 2;
            
            // Sets which dust and sound to use for the rocket flight
            // 1 - Rocket Boots
            // 2 - Fairy Boots, Spectre Boots, Lightning Boots
            // 3 - Frostspark Boots
            // 4 - Terrraspark Boots
            // 5 - Hellfire Treads
            player.vanityRocketBoots = 2;
            
            player.waterWalk2 = true; // Allows walking on all liquids without falling into it
            player.waterWalk = true; // Allows walking on water, honey, and shimmer without falling into it
            player.iceSkate = true; // Grant the player improved speed on ice and not breaking thin ice when falling onto it
            player.desertBoots = true; // Grants the player increased movement speed while running on sand
            player.fireWalk = true; // Grants the player immunity from Meteorite and Hellstone tile damage
            player.noFallDmg = true; // Grants the player the Lucky Horseshoe effect of nullifying fall damage
            player.lavaRose = true; // Grants the Lava Rose effect
            player.lavaMax += this.LavaImmunityTime * 60; // Grants the player 2 additional seconds of lava immunity
        }
        
        // These effects are visual only.
        if (vanity || !hideVisual) {
            player.CancelAllBootRunVisualEffects(); // This ensures that boot visual effects don't overlap if multiple are equipped
            
            // Hellfire Treads sprint dust. For more info on sprint dusts see Player.SpawnFastRunParticles() method in Player.cs
            player.hellfireTreads = true;
            // Other boot run visual effects include: sailDash, coldDash, desertDash, fairyBoots
            
            if (!player.mount.Active || player.mount.Type != Terraria.ID.MountID.WallOfFleshGoat) {
                // Spawns flames when walking, like Flame Waker Boots. We also check the Goat Skull mount so the effects don't overlap.
                //player.DoBootsEffect(player.DoBootsEffect_PlaceFlamesOnTile);
                player.DoBootsEffect_PlaceFlamesOnTile(player.Center.X, player.position.Y + player.height);
            }
        }
    }
}