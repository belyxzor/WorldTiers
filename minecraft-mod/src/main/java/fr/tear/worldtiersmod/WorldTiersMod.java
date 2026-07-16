package fr.tear.worldtiersmod;

import net.fabricmc.api.ModInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class WorldTiersMod implements ModInitializer {

    public static final String MOD_ID = "worldtiersmod";
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

    @Override
    public void onInitialize() {
        // Mod 100% client (environment: "client" dans fabric.mod.json), donc
        // pas de logique ici. Tout se passe dans WorldTiersModClient.
        LOGGER.info("[WorldTiers Tier Tagger] Initialisation (commune).");
    }
}