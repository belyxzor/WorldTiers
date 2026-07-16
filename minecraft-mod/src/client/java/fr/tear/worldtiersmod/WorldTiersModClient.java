package fr.tear.worldtiersmod;

import fr.tear.worldtiersmod.api.WorldTiersApi;
import fr.tear.worldtiersmod.cache.TierCache;
import fr.tear.worldtiersmod.client.WorldTiersMenuScreen;
import fr.tear.worldtiersmod.client.WorldTiersProfileScreen;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandManager;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.networking.v1.ClientPlayConnectionEvents;
import net.fabricmc.fabric.api.client.keybinding.v1.KeyBindingHelper;
import net.minecraft.client.option.KeyBinding;
import net.minecraft.client.util.InputUtil;
import net.minecraft.text.Text;
import net.minecraft.util.Formatting;
import net.minecraft.util.Identifier;
import org.lwjgl.glfw.GLFW;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public class WorldTiersModClient implements ClientModInitializer {

    public static final String BASE_API_URL = "https://worldtiers.ddns.net";

    public static final WorldTiersApi API = new WorldTiersApi();
    public static final TierCache TIER_CACHE = new TierCache(API);
    public static final DisplayModeState DISPLAY_MODE = new DisplayModeState();

    private static KeyBinding cycleModeKey;
    private static KeyBinding openMenuKey;
    private static final Set<UUID> CONNECTED_PLAYERS = new HashSet<>();
    private static int playerScanTicks;
    private static boolean menuOpenedForTest;
    private static boolean pendingMenuOpen;
    private static String pendingProfileUsername;
    private static boolean linkReminderChecked;

    // Catégorie "Divers" standard de Minecraft, définie comme un record
    // KeyBinding.Category depuis 1.21.11.
    private static final KeyBinding.Category CATEGORY =
            new KeyBinding.Category(Identifier.of(WorldTiersMod.MOD_ID, "keys"));

    @Override
    public void onInitializeClient() {
        WorldTiersMod.LOGGER.info("[WorldTiers Tier Tagger] Initialisation côté client.");

        API.fetchModes().thenAccept(DISPLAY_MODE::setModes);

        cycleModeKey = KeyBindingHelper.registerKeyBinding(new KeyBinding(
                "key.worldtiersmod.cycle_mode",
                InputUtil.Type.KEYSYM,
                InputUtil.UNKNOWN_KEY.getCode(),
                CATEGORY
        ));
        openMenuKey = KeyBindingHelper.registerKeyBinding(new KeyBinding(
                "key.worldtiersmod.open_menu",
                InputUtil.Type.KEYSYM,
                GLFW.GLFW_KEY_F8,
                CATEGORY
        ));

        ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> {
            dispatcher.register(ClientCommandManager.literal("worldtiers")
                    .executes(context -> openMenu())
                    .then(ClientCommandManager.literal("link")
                            .then(ClientCommandManager.argument("code", com.mojang.brigadier.arguments.StringArgumentType.word())
                                    .executes(context -> confirmDiscordLink(com.mojang.brigadier.arguments.StringArgumentType.getString(context, "code"))))));
            dispatcher.register(ClientCommandManager.literal("worldteirs")
                    .executes(context -> openMenu()));
            dispatcher.register(ClientCommandManager.literal("worldtiersprofile")
                    .executes(context -> {
                        var player = net.minecraft.client.MinecraftClient.getInstance().player;
                        return openProfile(player == null ? "" : player.getName().getString());
                    })
                    .then(ClientCommandManager.argument("joueur", com.mojang.brigadier.arguments.StringArgumentType.word())
                            .executes(context -> openProfile(com.mojang.brigadier.arguments.StringArgumentType.getString(context, "joueur")))));
            dispatcher.register(ClientCommandManager.literal("worldteirsprofile")
                    .executes(context -> {
                        var player = net.minecraft.client.MinecraftClient.getInstance().player;
                        return openProfile(player == null ? "" : player.getName().getString());
                    }));
        });

        ClientPlayConnectionEvents.JOIN.register((handler, sender, client) -> client.execute(() -> {
            checkDiscordLink(client);
            if (!menuOpenedForTest) {
                menuOpenedForTest = true;
                WorldTiersMod.LOGGER.info("[WorldTiers] Ouverture automatique du menu de vérification.");
                openMenu();
            }
        }));
        ClientPlayConnectionEvents.DISCONNECT.register((handler, client) -> linkReminderChecked = false);

        ClientTickEvents.END_CLIENT_TICK.register(client -> {
            // Les commandes sont validées depuis l'écran de chat. Il faut attendre
            // la fin du tick, sinon ChatScreen ferme et écrase le nouveau GUI.
            if (pendingMenuOpen) {
                pendingMenuOpen = false;
                openMenu();
            }
            if (pendingProfileUsername != null) {
                String username = pendingProfileUsername;
                pendingProfileUsername = null;
                openProfile(username);
            }

            // Scanne la liste une fois par seconde. Cela ne fait une requête API
            // que lorsqu'un nouveau joueur rejoint le serveur.
            if (++playerScanTicks >= 20) {
                playerScanTicks = 0;
                scanPlayers(client);
            }

            while (openMenuKey.wasPressed()) {
                openMenu();
            }

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

    private static void scanPlayers(net.minecraft.client.MinecraftClient client) {
        if (client.getNetworkHandler() == null) {
            if (!CONNECTED_PLAYERS.isEmpty()) {
                CONNECTED_PLAYERS.clear();
                TIER_CACHE.clear();
            }
            return;
        }

        Set<UUID> currentPlayers = new HashSet<>();
        for (var entry : client.getNetworkHandler().getPlayerList()) {
            var profile = entry.getProfile();
            if (profile == null) continue;
            UUID uuid = profile.id();
            currentPlayers.add(uuid);
            if (CONNECTED_PLAYERS.add(uuid)) {
                TIER_CACHE.fetchOnJoin(uuid, profile.name());
            }
        }

        for (UUID uuid : new HashSet<>(CONNECTED_PLAYERS)) {
            if (!currentPlayers.contains(uuid)) {
                CONNECTED_PLAYERS.remove(uuid);
                TIER_CACHE.remove(uuid);
            }
        }
    }

    private static int openProfile(String username) {
        if (username == null || username.isBlank()) return 0;
        var minecraft = net.minecraft.client.MinecraftClient.getInstance();
        minecraft.setScreen(new WorldTiersProfileScreen(minecraft.currentScreen, username));
        return 1;
    }

    private static int openMenu() {
        WorldTiersMod.LOGGER.info("[WorldTiers] Ouverture du menu.");
        var minecraft = net.minecraft.client.MinecraftClient.getInstance();
        minecraft.setScreen(new WorldTiersMenuScreen(minecraft.currentScreen));
        return 1;
    }

    private static int confirmDiscordLink(String code) {
        var client = net.minecraft.client.MinecraftClient.getInstance();
        if (client.player == null) return 0;
        String username = client.player.getName().getString();
        API.confirmDiscordLink(code, username, client.player.getUuidAsString()).thenAccept(error -> client.execute(() -> {
            if (client.player != null) client.player.sendMessage(
                    Text.literal(error.isEmpty() ? "[WorldTiers] Compte Discord lié avec succès !" : "[WorldTiers] " + error)
                            .formatted(error.isEmpty() ? Formatting.GREEN : Formatting.RED), false);
        }));
        return 1;
    }

    private static void checkDiscordLink(net.minecraft.client.MinecraftClient client) {
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

    /**
     * Fallback direct : les commandes fonctionnent même si le dispatcher du
     * serveur ne présente pas les commandes client dans les suggestions.
     */
    public static boolean handleChatCommand(String rawMessage) {
        if (rawMessage == null) return false;
        WorldTiersMod.LOGGER.info("[WorldTiers] Chat reçu : {}", rawMessage);
        String message = rawMessage.trim();
        if (message.startsWith("/")) message = message.substring(1);
        String lower = message.toLowerCase(java.util.Locale.ROOT);

        if (lower.equals("worldtiers") || lower.equals("worldteirs")) {
            pendingMenuOpen = true;
            return true;
        }

        if (lower.startsWith("worldtiers link ")) {
            String code = message.substring("worldtiers link ".length()).trim();
            if (!code.isBlank()) confirmDiscordLink(code);
            return true;
        }

        String[] profilePrefixes = {"worldtiersprofile", "worldteirsprofile"};
        for (String prefix : profilePrefixes) {
            if (lower.equals(prefix) || lower.startsWith(prefix + " ")) {
                String username = message.length() > prefix.length() ? message.substring(prefix.length()).trim() : "";
                if (username.isBlank()) {
                    var player = net.minecraft.client.MinecraftClient.getInstance().player;
                    username = player == null ? "" : player.getName().getString();
                }
                pendingProfileUsername = username;
                return true;
            }
        }
        return false;
    }
}
