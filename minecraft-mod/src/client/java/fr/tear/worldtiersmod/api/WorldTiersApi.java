package fr.tear.worldtiersmod.api;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.concurrent.CompletableFuture;
import java.util.List;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import fr.tear.worldtiersmod.WorldTiersMod;
import fr.tear.worldtiersmod.WorldTiersModClient;

/**
 * Client HTTP minimal for the WorldTiers API.
 */
public class WorldTiersApi {

    // This will be configurable by the user.
    private static final String BASE_URL = WorldTiersModClient.BASE_API_URL;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private static final String[] MODES = {
            "sword", "crystal", "uhc", "nethpot", "pot", "smp", "axe", "diasmp", "mace", "spear-mace"
    };

    /**
     * Récupère le profil public WorldTiers en une seule requête.
     * Un tag n'est créé que pour les tiers réellement présents dans le profil,
     * jamais à partir d'une réponse d'un autre classement ou d'un cache externe.
     */
    public CompletableFuture<List<PlayerTier>> fetchPlayerTiers(String pseudo) {
        String encodedPseudo = URLEncoder.encode(pseudo, StandardCharsets.UTF_8);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/user/" + encodedPseudo))
                .timeout(Duration.ofSeconds(8))
                .header("Accept", "application/json")
                .GET()
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> {
                    if (response.statusCode() == 404) return List.<PlayerTier>of();
                    if (response.statusCode() != 200) {
                        WorldTiersMod.LOGGER.warn("[WorldTiersApi] Réponse profil inattendue ({}) pour {}", response.statusCode(), pseudo);
                        return List.<PlayerTier>of();
                    }
                    try {
                        JsonObject profile = JsonParser.parseString(response.body()).getAsJsonObject();
                        if (!profile.has("tiers") || !profile.get("tiers").isJsonObject()) return List.<PlayerTier>of();

                        boolean retired = profile.has("retired") && profile.get("retired").getAsBoolean();
                        List<PlayerTier> result = new ArrayList<>();
                        for (var entry : profile.getAsJsonObject("tiers").entrySet()) {
                            String tier = entry.getValue().getAsString().toUpperCase();
                            if (!tier.matches("(?:HT|LT)[1-5]")) continue;
                            boolean high = tier.startsWith("HT");
                            int level = Integer.parseInt(tier.substring(2));
                            String mode = entry.getKey();
                            result.add(new PlayerTier(level, high, retired, mode, mode));
                        }
                        return result;
                    } catch (Exception error) {
                        WorldTiersMod.LOGGER.warn("[WorldTiersApi] Profil invalide pour {} : {}", pseudo, error.getMessage());
                        return List.<PlayerTier>of();
                    }
                })
                .exceptionally(error -> {
                    WorldTiersMod.LOGGER.warn("[WorldTiersApi] Impossible de récupérer le profil de {} : {}", pseudo, error.getMessage());
                    return List.<PlayerTier>of();
                });
    }

    /** Profil public pour l'écran WorldTiers intégré au jeu. */
    public CompletableFuture<JsonObject> fetchProfile(String pseudo) {
        String url = BASE_URL + "/api/user/" + URLEncoder.encode(pseudo, StandardCharsets.UTF_8);
        return httpClient.sendAsync(HttpRequest.newBuilder().uri(URI.create(url)).timeout(Duration.ofSeconds(8)).GET().build(), HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> response.statusCode() == 200 ? JsonParser.parseString(response.body()).getAsJsonObject() : null)
                .exceptionally(error -> null);
    }

    /** Top public pour l'écran WorldTiers intégré au jeu. */
    public CompletableFuture<JsonArray> fetchTopPlayers() {
        String url = BASE_URL + "/api/top100";
        return httpClient.sendAsync(HttpRequest.newBuilder().uri(URI.create(url)).timeout(Duration.ofSeconds(8)).GET().build(), HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> response.statusCode() == 200 ? JsonParser.parseString(response.body()).getAsJsonArray() : new JsonArray())
                .exceptionally(error -> new JsonArray());
    }

    /** Vérifie si le compte Minecraft a confirmé sa liaison Discord. */
    public CompletableFuture<Boolean> isDiscordLinked(String username) {
        String url = BASE_URL + "/api/link/status/" + URLEncoder.encode(username, StandardCharsets.UTF_8);
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).timeout(Duration.ofSeconds(8)).GET().build();
        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString()).thenApply(response -> {
            if (response.statusCode() != 200) return true;
            try { return JsonParser.parseString(response.body()).getAsJsonObject().get("linked").getAsBoolean(); }
            catch (Exception ignored) { return true; }
        }).exceptionally(error -> true);
    }

    /** Confirme depuis Minecraft le code généré par le bot Discord. */
    public CompletableFuture<String> confirmDiscordLink(String code, String username, String minecraftUuid) {
        JsonObject body = new JsonObject();
        body.addProperty("code", code);
        body.addProperty("username", username);
        body.addProperty("minecraft_uuid", minecraftUuid.replace("-", ""));
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(BASE_URL + "/api/link/confirm"))
                .timeout(Duration.ofSeconds(8)).header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body.toString())).build();
        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString()).thenApply(response -> {
            try {
                JsonObject result = JsonParser.parseString(response.body()).getAsJsonObject();
                return response.statusCode() == 200 && result.get("ok").getAsBoolean() ? "" : result.has("error") ? result.get("error").getAsString() : "Erreur de liaison inconnue.";
            } catch (Exception ignored) { return "Réponse WorldTiers invalide."; }
        }).exceptionally(error -> "Impossible de joindre WorldTiers.");
    }

    /**
     * Placeholder method to fetch modes from WorldTiers API.
     * User will implement the actual logic.
     */
    public CompletableFuture<List<ModeInfo>> fetchModes() {
        // Return hardcoded modes as the API endpoint doesn't exist yet
        List<ModeInfo> modeInfos = new ArrayList<>();
        for (String mode : MODES) {
            String name = mode.substring(0, 1).toUpperCase() + mode.substring(1);
            if (mode.equals("spear-mace")) name = "Spear Mace";
            else if (mode.equals("uhc")) name = "UHC";
            else if (mode.equals("smp")) name = "SMP";
            else if (mode.equals("diasmp")) name = "Dia SMP";
            modeInfos.add(new ModeInfo(mode, name));
        }
        return CompletableFuture.completedFuture(modeInfos);
    }

    /**
     * Fetch branding from WorldTiers API.
     */
    public CompletableFuture<BrandingInfo> fetchBranding() {
        String url = BASE_URL + "/api/v1/branding";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(8))
                .header("Accept", "application/json")
                .GET()
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> {
                    if (response.statusCode() != 200) {
                        WorldTiersMod.LOGGER.warn(
                                "[WorldTiersApi] Failed to fetch /branding ({})",
                                response.statusCode());
                        return new BrandingInfo();
                    }
                    // Needs proper parsing implementation
                    return new BrandingInfo();
                })
                .exceptionally(throwable -> {
                    WorldTiersMod.LOGGER.warn(
                            "[WorldTiersApi] Failed to request {} : {}",
                            url, throwable.getMessage());
                    return new BrandingInfo();
                });
    }

    /**
     * Fetches player tiers for a specific mode.
     */
    public CompletableFuture<List<PlayerTier>> fetchTierForMode(String mode, String pseudo) {
        String url = BASE_URL + "/api/" + mode + "/user/" + pseudo;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(8))
                .header("Accept", "application/json")
                .GET()
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> {
                    if (response.statusCode() == 404) {
                        return List.<PlayerTier>of();
                    }
                    if (response.statusCode() != 200) {
                        WorldTiersMod.LOGGER.warn(
                                "[WorldTiersApi] Unexpected response ({}) for {} (mode: {})",
                                response.statusCode(), url, mode);
                        return List.<PlayerTier>of();
                    }
                    try {
                        JsonElement root = JsonParser.parseString(response.body());
                        List<PlayerTier> result = new ArrayList<>();
                        
                        if (root.isJsonObject()) {
                            // If it's a single object
                            PlayerTier tier = PlayerTier.fromJson(root.getAsJsonObject());
                            if (tier != null) {
                                result.add(tier);
                            } else {
                                // If it doesn't have mode, inject it
                                JsonObject obj = root.getAsJsonObject();
                                if (!obj.has("mode")) {
                                    JsonObject modeObj = new JsonObject();
                                    modeObj.addProperty("slug", mode);
                                    modeObj.addProperty("name", mode);
                                    obj.add("mode", modeObj);
                                    tier = PlayerTier.fromJson(obj);
                                    if (tier != null) {
                                        result.add(tier);
                                    }
                                }
                            }
                        } else if (root.isJsonArray()) {
                            // If it's an array of objects
                            for (JsonElement element : root.getAsJsonArray()) {
                                if (element.isJsonObject()) {
                                    JsonObject obj = element.getAsJsonObject();
                                    PlayerTier tier = PlayerTier.fromJson(obj);
                                    if (tier != null) {
                                        result.add(tier);
                                    } else {
                                        if (!obj.has("mode")) {
                                            JsonObject modeObj = new JsonObject();
                                            modeObj.addProperty("slug", mode);
                                            modeObj.addProperty("name", mode);
                                            obj.add("mode", modeObj);
                                            tier = PlayerTier.fromJson(obj);
                                            if (tier != null) {
                                                result.add(tier);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        return result;
                    } catch (Exception e) {
                        WorldTiersMod.LOGGER.warn("[WorldTiersApi] JSON parsing error for {} : {}", url, e.getMessage());
                        return List.<PlayerTier>of();
                    }
                })
                .exceptionally(throwable -> {
                    WorldTiersMod.LOGGER.warn(
                            "[WorldTiersApi] Failed to request {} (mode: {}) : {}",
                            url, mode, throwable.getMessage());
                    return List.of();
                });
    }

    /**
     * Placeholder method to fetch icon bytes from WorldTiers API.
     * User will implement the actual logic.
     */
    public CompletableFuture<byte[]> fetchIconBytes(String urlOrPath) {
        WorldTiersMod.LOGGER.warn("[WorldTiersApi] fetchIconBytes is a placeholder and needs implementation.");
        return CompletableFuture.completedFuture(null);
    }

    private String resolveUrl(String urlOrPath) {
        if (urlOrPath == null || urlOrPath.isBlank()) {
            return null;
        }
        if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
            return urlOrPath;
        }
        if (urlOrPath.startsWith("/")) {
            return BASE_URL + urlOrPath;
        }
        return null;
    }
}
