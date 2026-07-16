package fr.tear.worldtiersmod;

import fr.tear.worldtiersmod.api.WorldTiersApi;
import fr.tear.worldtiersmod.cache.TierCache;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.networking.v1.ClientPlayConnectionEvents;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandManager;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback;
import com.mojang.brigadier.arguments.StringArgumentType;
import net.minecraft.client.MinecraftClient;
import net.fabricmc.fabric.api.client.keybinding.v1.KeyBindingHelper;
import net.minecraft.client.option.KeyBinding;
import net.minecraft.client.util.InputUtil;
import net.minecraft.text.Text;
import net.minecraft.util.Formatting;
import net.minecraft.util.Identifier;

public class WorldTiersModClient implements ClientModInitializer {

    public static String BASE_API_URL = "https://worldtiers.ddns.net";

    public static final WorldTiersApi API = new WorldTiersApi();
    public static final TierCache TIER_CACHE = new TierCache(API);
    public static final DisplayModeState DISPLAY_MODE = new DisplayModeState();

    private static KeyBinding cycleModeKey;
    private static boolean linkReminderChecked = false;

    // Catégorie "Divers" standard de Minecraft, définie comme un record
    // KeyBinding.Category depuis 1.21.11.
    private static final KeyBinding.Category CATEGORY =
            new KeyBinding.Category(Identifier.of(WorldTiersMod.MOD_ID, "keys"));

    @Override
    public void onInitializeClient() {
        WorldTiersMod.LOGGER.info("[WorldTiers Tier Tagger] Initialisation côté client.");

        API.fetchModes().thenAccept(DISPLAY_MODE::setModes);

        ClientPlayConnectionEvents.JOIN.register((handler, sender, client) -> checkDiscordLink(client));
        ClientPlayConnectionEvents.DISCONNECT.register((handler, client) -> linkReminderChecked = false);
        ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> dispatcher.register(
                ClientCommandManager.literal("worldtiers").then(ClientCommandManager.literal("link")
                        .then(ClientCommandManager.argument("code", StringArgumentType.word()).executes(context -> {
                            MinecraftClient client = MinecraftClient.getInstance();
                            if (client.player == null) return 0;
                            String code = StringArgumentType.getString(context, "code");
                            String username = client.player.getName().getString();
                            API.confirmDiscordLink(code, username, client.player.getUuidAsString()).thenAccept(ok -> client.execute(() ->
                                    client.player.sendMessage(Text.literal(ok ? "[WorldTiers] Compte Discord lié avec succès !" : "[WorldTiers] Code invalide ou expiré. Recommence avec /link sur Discord.")
                                            .formatted(ok ? Formatting.GREEN : Formatting.RED), false)));
                            return 1;
                        })))
        ));

        cycleModeKey = KeyBindingHelper.registerKeyBinding(new KeyBinding(
                "key.worldtiersmod.cycle_mode",
                InputUtil.Type.KEYSYM,
                InputUtil.UNKNOWN_KEY.getCode(),
                CATEGORY
        ));

        ClientTickEvents.END_CLIENT_TICK.register(client -> {
            while (cycleModeKey.wasPressed()) {
                String label = DISPLAY_MODE.cycle();
                if (client.player != null) {
                    client.player.sendMessage(
                            Text.literal("[WorldTiers] Mode affiché : ").formatted(Formatting.GOLD)
                                    .append(Text.literal(label).formatted(Formatting.WHITE)),
                            true
                    );
                }
            }
        });
    }

    private static void checkDiscordLink(MinecraftClient client) {
        if (linkReminderChecked || client.player == null) return;
        linkReminderChecked = true;
        String username = client.player.getName().getString();
        API.isDiscordLinked(username).thenAccept(linked -> {
            if (!linked) client.execute(() -> {
                if (client.player != null) client.player.sendMessage(
                        Text.literal("[WorldTiers] Ton compte Discord n'est pas lié. Fais /link " + username + " sur le Discord, puis /worldtiers link CODE ici.")
                                .formatted(Formatting.GOLD), false);
            });
        });
    }
}
