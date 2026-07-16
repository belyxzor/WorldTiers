package fr.tear.worldtiersmod.cache;

import fr.tear.worldtiersmod.WorldTiersMod;
import fr.tear.worldtiersmod.api.WorldTiersApi;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Cache mémoire par joueur. L'API est appelée une seule fois à son arrivée sur
 * le serveur ; l'entrée est retirée lorsqu'il part.
 */
public class TierCache {

    private final WorldTiersApi api;
    private final Map<UUID, CacheEntry> cache = new ConcurrentHashMap<>();

    public TierCache(WorldTiersApi api) {
        this.api = api;
    }

    /** Lance une seule requête API pour un joueur nouvellement détecté. */
    public void fetchOnJoin(UUID uuid, String pseudo) {
        CacheEntry loading = new CacheEntry(CacheEntry.State.LOADING, List.of(), System.currentTimeMillis());
        if (cache.putIfAbsent(uuid, loading) != null) {
            return;
        }

        api.fetchPlayerTiers(pseudo).thenAccept(tiers -> {
            CacheEntry.State state = tiers.isEmpty() ? CacheEntry.State.NOT_RANKED : CacheEntry.State.LOADED;
            cache.put(uuid, new CacheEntry(state, tiers, System.currentTimeMillis()));
            WorldTiersMod.LOGGER.info("[WorldTiers] {} -> {} tier(s), état {}", uuid, tiers.size(), state);
        }).exceptionally(error -> {
            cache.put(uuid, new CacheEntry(CacheEntry.State.ERROR, List.of(), System.currentTimeMillis()));
            WorldTiersMod.LOGGER.warn("[WorldTiers] Échec API pour {} : {}", uuid, error.getMessage());
            return null;
        });
    }

    /** Retourne seulement le cache : aucun appel réseau depuis le rendu Tab. */
    public CacheEntry get(UUID uuid) {
        return cache.get(uuid);
    }

    public void remove(UUID uuid) {
        cache.remove(uuid);
    }

    public void clear() {
        cache.clear();
    }
}
