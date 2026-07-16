package fr.tear.worldtiersmod.api;

import com.google.gson.JsonObject;

/**
 * Représente une entrée de tier pour un joueur sur un mode donné.
 * Reflète la structure utilisée par WorldTiers dans plusieurs endpoints publics
 * (ex: /api/v1/leaderboard -> tiers[]).
 */
public class PlayerTier {

    public final int tier;          // 1 (meilleur) à 5 (moins bon)
    public final boolean high;      // true = position "high" (HT), false = "low" (LT)
    public final boolean retired;
    public final String modeSlug;
    public final String modeName;

    public PlayerTier(int tier, boolean high, boolean retired, String modeSlug, String modeName) {
        this.tier = tier;
        this.high = high;
        this.retired = retired;
        this.modeSlug = modeSlug;
        this.modeName = modeName;
    }

    /** Code court conventionnel : HT2, LT4, etc. */
    public String shortCode() {
        return (high ? "HT" : "LT") + tier;
    }

    /**
     * Détermine si CE tier est "meilleur" que l'autre (à afficher en priorité).
     * Tier numérique plus petit = meilleur. À tier égal, "high" (HT) bat "low" (LT).
     */
    public boolean isBetterThan(PlayerTier other) {
        if (other == null) return true;
        if (this.tier != other.tier) {
            return this.tier < other.tier;
        }
        return this.high && !other.high;
    }

    /**
     * Parsing défensif : suppose une structure proche de celle vue dans
     * /api/v1/leaderboard et /api/protected/discord/users (tiers[].mode.slug/name).
     * Retourne null si l'objet ne correspond pas au format attendu.
     */
    public static PlayerTier fromJson(JsonObject obj) {
        if (!obj.has("tier") || obj.get("tier").isJsonNull()) {
            return null;
        }

        int tier = 5;
        boolean high = false;

        // Support string format like "HT1" or old integer format
        if (obj.get("tier").getAsJsonPrimitive().isString()) {
            String tierStr = obj.get("tier").getAsString().toUpperCase();
            if (tierStr.length() >= 3) {
                if (tierStr.startsWith("HT")) {
                    high = true;
                    try { tier = Integer.parseInt(tierStr.substring(2)); } catch(NumberFormatException ignored) {}
                } else if (tierStr.startsWith("LT")) {
                    high = false;
                    try { tier = Integer.parseInt(tierStr.substring(2)); } catch(NumberFormatException ignored) {}
                }
            }
        } else {
            tier = obj.get("tier").getAsInt();
            if (obj.has("position") && !obj.get("position").isJsonNull()) {
                high = "high".equalsIgnoreCase(obj.get("position").getAsString());
            }
        }

        boolean retired = obj.has("retired") && !obj.get("retired").isJsonNull()
                && obj.get("retired").getAsBoolean();
        if (!obj.has("retired")) {
            // fallback for older "isRetired" naming if needed
            retired = obj.has("isRetired") && !obj.get("isRetired").isJsonNull()
                    && obj.get("isRetired").getAsBoolean();
        }

        String slug = "unknown";
        String name = "unknown";

        if (obj.has("mode") && !obj.get("mode").isJsonNull()) {
            if (obj.get("mode").isJsonObject()) {
                JsonObject modeObj = obj.getAsJsonObject("mode");
                slug = (modeObj.has("slug") && !modeObj.get("slug").isJsonNull())
                        ? modeObj.get("slug").getAsString() : "unknown";
                name = (modeObj.has("name") && !modeObj.get("name").isJsonNull())
                        ? modeObj.get("name").getAsString() : slug;
            } else {
                slug = obj.get("mode").getAsString();
                name = slug.substring(0, 1).toUpperCase() + slug.substring(1);
            }
        }

        return new PlayerTier(tier, high, retired, slug, name);
    }
}