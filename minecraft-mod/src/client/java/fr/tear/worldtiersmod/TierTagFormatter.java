package fr.tear.worldtiersmod;

import fr.tear.worldtiersmod.api.PlayerTier;
import net.minecraft.text.MutableText;
import net.minecraft.text.Style;
import net.minecraft.text.StyleSpriteSource;
import net.minecraft.text.Text;
import net.minecraft.util.Formatting;
import net.minecraft.util.Identifier;

import java.util.List;
import java.util.Map;

public final class TierTagFormatter {

    private TierTagFormatter() {}

    // StyleSpriteSource.Font est le record qui wrape un Identifier pour
    // l'utiliser comme police custom dans Style.withFont() depuis 1.21.11.
    private static final StyleSpriteSource MODES_FONT =
            new StyleSpriteSource.Font(Identifier.of(WorldTiersMod.MOD_ID, "modes"));

    private static final Map<String, Character> MODE_CHARS = Map.of(
            "crystal",  '\uE000',
            "sword",    '\uE001',
            "uhc",      '\uE002',
            "nethpot",  '\uE003',
            "pot",      '\uE004',
            "smp",      '\uE005',
            "axe",      '\uE006',
            "diasmp",   '\uE007',
            "mace",     '\uE008',
            "spear-mace", '\uE009'
    );

    public static PlayerTier pickBestTier(List<PlayerTier> tiers) {
        PlayerTier best = null;
        for (PlayerTier candidate : tiers) {
            if (candidate.retired) continue;
            if (candidate.isBetterThan(best)) {
                best = candidate;
            }
        }
        return best;
    }

    public static Formatting colorFor(int tier) {
        return switch (tier) {
            case 1 -> Formatting.RED;
            case 2 -> Formatting.GOLD;
            case 3 -> Formatting.YELLOW;
            case 4 -> Formatting.GREEN;
            default -> Formatting.AQUA;
        };
    }

    public static MutableText buildTag(PlayerTier best) {
        Formatting color = colorFor(best.tier);
        MutableText tag = Text.empty();

        Character iconChar = MODE_CHARS.get(best.modeSlug);
        if (iconChar != null) {
            MutableText icon = Text.literal(String.valueOf(iconChar))
                    .setStyle(Style.EMPTY
                            .withFont(MODES_FONT)
                            .withColor(Formatting.WHITE));
            tag.append(icon);
            tag.append(Text.literal(" ").formatted(Formatting.RESET));
        }

        // Format unique WorldTiers : icône + tier | pseudo.
        tag.append(Text.literal(best.shortCode() + " | ").formatted(color));
        return tag;
    }

    /** Texte de bouton avec le glyphe du mode dans la police WorldTiers. */
    public static Text modeButtonLabel(String modeSlug, String label) {
        Character iconChar = MODE_CHARS.get(modeSlug);
        MutableText result = Text.empty();
        if (iconChar != null) {
            result.append(Text.literal(String.valueOf(iconChar))
                    .setStyle(Style.EMPTY.withFont(MODES_FONT).withColor(Formatting.WHITE)));
            result.append(Text.literal(" "));
        }
        return result.append(Text.literal(label));
    }
}
