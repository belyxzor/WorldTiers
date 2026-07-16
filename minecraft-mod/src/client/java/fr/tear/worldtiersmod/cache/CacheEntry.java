package fr.tear.worldtiersmod.cache;

import fr.tear.worldtiersmod.api.PlayerTier;

import java.util.List;

public class CacheEntry {

    public enum State {
        LOADING,
        LOADED,
        NOT_RANKED,
        ERROR
    }

    public final State state;
    public final List<PlayerTier> tiers;
    public final long timestampMillis;

    public CacheEntry(State state, List<PlayerTier> tiers, long timestampMillis) {
        this.state = state;
        this.tiers = tiers;
        this.timestampMillis = timestampMillis;
    }

    public boolean isExpired(long now, long positiveTtlMillis, long negativeTtlMillis) {
        long ttl = (state == State.LOADED) ? positiveTtlMillis : negativeTtlMillis;
        return (now - timestampMillis) > ttl;
    }
}