package fr.tear.worldtiersmod;

import fr.tear.worldtiersmod.api.ModeInfo;
import fr.tear.worldtiersmod.api.PlayerTier;

import java.util.ArrayList;
import java.util.List;

/**
 * État global (côté client) du mode actuellement sélectionné pour
 * l'affichage des tags. -1 = automatique (meilleur tier toutes modes
 * confondues), sinon index dans la liste des modes récupérée depuis
 * /api/v1/modes/.
 */
public class DisplayModeState {

    private final List<ModeInfo> modes = new ArrayList<>();
    private int selectedIndex = -1; // -1 = auto

    public void setModes(List<ModeInfo> modes) {
        this.modes.clear();
        this.modes.addAll(modes);
    }

    /** Passe au mode suivant (auto -> mode 1 -> mode 2 -> ... -> auto). Retourne le libellé du nouveau mode. */
    public String cycle() {
        if (modes.isEmpty()) {
            selectedIndex = -1;
            return "Auto (meilleur tier)";
        }
        selectedIndex++;
        if (selectedIndex >= modes.size()) {
            selectedIndex = -1;
        }
        return currentLabel();
    }

    public String currentLabel() {
        if (selectedIndex < 0 || selectedIndex >= modes.size()) {
            return "Auto (meilleur tier)";
        }
        return modes.get(selectedIndex).name();
    }

    public List<ModeInfo> availableModes() {
        return List.copyOf(modes);
    }

    public void selectAuto() {
        selectedIndex = -1;
    }

    public void selectMode(String slug) {
        for (int index = 0; index < modes.size(); index++) {
            if (modes.get(index).slug().equals(slug)) {
                selectedIndex = index;
                return;
            }
        }
        selectedIndex = -1;
    }

    /** Sélectionne le tier à afficher pour un joueur selon le mode actuellement choisi. */
    public PlayerTier select(List<PlayerTier> tiers) {
        if (selectedIndex < 0 || selectedIndex >= modes.size()) {
            return TierTagFormatter.pickBestTier(tiers);
        }
        String slug = modes.get(selectedIndex).slug();
        for (PlayerTier tier : tiers) {
            if (!tier.retired && tier.modeSlug.equals(slug)) {
                return tier;
            }
        }
        return null;
    }
}
