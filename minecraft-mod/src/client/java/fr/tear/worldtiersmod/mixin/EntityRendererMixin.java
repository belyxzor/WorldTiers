package fr.tear.worldtiersmod.mixin;

import fr.tear.worldtiersmod.WorldTiersModClient;
import fr.tear.worldtiersmod.TierTagFormatter;
import fr.tear.worldtiersmod.api.PlayerTier;
import fr.tear.worldtiersmod.cache.CacheEntry;
import net.minecraft.client.render.entity.EntityRenderer;
import net.minecraft.entity.Entity;
import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.text.MutableText;
import net.minecraft.text.Text;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

import java.util.UUID;

/**
 * Injecte le tag de tier devant le pseudo affiché au-dessus de la tête des
 * joueurs dans le monde (nametag 3D, visible en 3e personne ou avec un mod
 * qui affiche son propre nametag).
 *
 * NOTE : "getDisplayName" est la méthode générique de EntityRenderer<T> qui
 * fournit le Text du nametag (utilisée par tout type d'entité, pas que les
 * joueurs, d'où le filtre instanceof PlayerEntity ci-dessous pour ne pas
 * spammer l'API avec des UUID de mobs). Comme pour PlayerListHudMixin, si
 * la compilation échoue ici, vérifie le nom exact via "Go to declaration"
 * sur EntityRenderer dans IntelliJ.
 */
@Mixin(EntityRenderer.class)
public abstract class EntityRendererMixin {

    @Inject(method = "getDisplayName", at = @At("RETURN"), cancellable = true)
    private void worldtiersmod$appendTier(Entity entity, CallbackInfoReturnable<Text> cir) {
        if (!(entity instanceof PlayerEntity)) {
            return;
        }

        UUID uuid = entity.getUuid();
        String pseudo = entity.getName().getString();
        CacheEntry cacheEntry = WorldTiersModClient.TIER_CACHE.get(uuid);

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
