package fr.tear.worldtiersmod.api;

import com.google.gson.JsonObject;

import java.util.HashMap;
import java.util.Map;

/**
 * Config de branding WorldTiers (GET /api/v1/branding). On ne garde ici
 * que la map modeIcons (slug -> valeur d'icône), utilisée pour les icônes
 * imagées par mode.
 *
 * NOTE : le format exact des valeurs de modeIcons n'est pas garanti par la
 * spec publique (juste "type: string"). IconManager essaie de les traiter
 * comme des URLs d'image absolues ou relatives au site, et ignore
 * silencieusement les modes pour lesquels ça échoue. Si les icônes ne
 * s'affichent pas du tout, colle-moi un exemple réel de réponse de
 * /api/v1/branding pour que j'ajuste le parsing.
 */
public class BrandingInfo {

    public final Map<String, String> modeIcons = new HashMap<>();

    public static BrandingInfo fromJson(JsonObject obj) {
        BrandingInfo branding = new BrandingInfo();
        if (obj.has("modeIcons") && obj.get("modeIcons").isJsonObject()) {
            JsonObject icons = obj.getAsJsonObject("modeIcons");
            for (String key : icons.keySet()) {
                if (!icons.get(key).isJsonNull()) {
                    branding.modeIcons.put(key, icons.get(key).getAsString());
                }
            }
        }
        return branding;
    }
}