package fr.tear.worldtiersmod.api;

import com.google.gson.JsonObject;

/**
 * Représente un mode de jeu WorldTiers (ex: "vanilla", "mace"), tel que
 * retourné par GET /api/v1/modes/.
 */
public record ModeInfo(String slug, String name) {

    public static ModeInfo fromJson(JsonObject obj) {
        if (!obj.has("slug") || obj.get("slug").isJsonNull()) {
            return null;
        }
        String slug = obj.get("slug").getAsString();
        String name = (obj.has("name") && !obj.get("name").isJsonNull())
                ? obj.get("name").getAsString() : slug;
        return new ModeInfo(slug, name);
    }
}