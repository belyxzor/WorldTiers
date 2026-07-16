package fr.tear.worldtiersmod.mixin;

import com.mojang.authlib.GameProfile;
import fr.tear.worldtiersmod.WorldTiersModClient;
import fr.tear.worldtiersmod.TierTagFormatter;
import fr.tear.worldtiersmod.api.PlayerTier;
import fr.tear.worldtiersmod.cache.CacheEntry;
import net.minecraft.client.gui.hud.PlayerListHud;
import net.minecraft.client.network.PlayerListEntry;
import net.minecraft.text.MutableText;
import net.minecraft.text.Text;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

import java.util.UUID;

/**
 * Injecte le tag de tier FranceRanked devant le pseudo de chaque joueur affiché
 * dans la liste des joueurs (tab list, touche Tab).
 *
 * NOTE : le nom "getPlayerName" correspond aux mappings Yarn 1.21.5+build.1
 * au moment de l'écriture de ce fichier. Si la compilation échoue sur cette
 * ligne, fais un clic droit sur PlayerListHud dans IntelliJ -> "Go to
 * declaration" pour vérifier le nom exact de la méthode qui retourne le
 * Text du pseudo, et ajuste le "method =" ci-dessous en conséquence.
 */
@Mixin(PlayerListHud.class)
public class PlayerListHudMixin {

    @Inject(method = "getPlayerName", at = @At("RETURN"), cancellable = true)
    private void worldtiersmod$appendTier(PlayerListEntry entry, CallbackInfoReturnable<Text> cir) {
        GameProfile profile = entry.getProfile();
        if (profile == null) {
            return;
        }

        UUID uuid = profile.id();
        String pseudo = profile.name();
        CacheEntry cacheEntry = WorldTiersModClient.TIER_CACHE.getOrFetch(uuid, pseudo);

        if (cacheEntry == null || cacheEntry.state != CacheEntry.State.LOADED) {
            return;
        }

        PlayerTier best = WorldTiersModClient.DISPLAY_MODE.select(cacheEntry.tiers);
        if (best == null) {
            return;
        }

        MutableText tag = TierTagFormatter.buildTag(best);
        Text original = cir.getReturnValue();
        cir.setReturnValue(tag.append(original));
    }
}
