package fr.tear.worldtiersmod.cache;

import fr.tear.worldtiersmod.WorldTiersMod;
import fr.tear.worldtiersmod.api.WorldTiersApi;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Cache en mémoire des tiers par joueur, avec déduplication des requêtes en vol
 * et expiration différenciée (positif vs négatif/erreur).
 */
public class TierCache {

    private static final long POSITIVE_TTL_MILLIS = 5 * 60 * 1000L;  // 5 minutes
    private static final long NEGATIVE_TTL_MILLIS = 60 * 1000L;      // 1 minute

    private final WorldTiersApi api;
    private final Map<UUID, CacheEntry> cache = new ConcurrentHashMap<>();

    public TierCache(WorldTiersApi api) {
        this.api = api;
    }

    /**
     * Retourne l'entrée actuellement en cache pour ce joueur (peut être en LOADING si
     * c'est le tout premier appel), et déclenche une requête asynchrone si l'entrée est
     * absente ou expirée. Ne bloque jamais le thread appelant.
     */
    public CacheEntry getOrFetch(UUID uuid, String pseudo) {
        long now = System.currentTimeMillis();
        CacheEntry entry = cache.get(uuid);

        boolean needsFetch = entry == null
                || (entry.state != CacheEntry.State.LOADING
                && entry.isExpired(now, POSITIVE_TTL_MILLIS, NEGATIVE_TTL_MILLIS));

        if (needsFetch) {
            cache.put(uuid, new CacheEntry(CacheEntry.State.LOADING, List.of(), now));
            api.fetchPlayerTiers(pseudo).thenAccept(tiers -> {
                CacheEntry.State state = tiers.isEmpty()
                        ? CacheEntry.State.NOT_RANKED
                        : CacheEntry.State.LOADED;
                cache.put(uuid, new CacheEntry(state, tiers, System.currentTimeMillis()));
                WorldTiersMod.LOGGER.info(
                        "[WorldTiers Tier Tagger] {} -> {} tier(s) trouvé(s) (état: {}).",
                        uuid, tiers.size(), state);
            });
        }

        return cache.get(uuid);
    }

    public void invalidate(UUID uuid) {
        cache.remove(uuid);
    }

    public void clear() {
        cache.clear();
    }
}