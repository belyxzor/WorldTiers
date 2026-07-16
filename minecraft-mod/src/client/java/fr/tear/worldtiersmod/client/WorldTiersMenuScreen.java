package fr.tear.worldtiersmod.client;

import fr.tear.worldtiersmod.WorldTiersModClient;
import fr.tear.worldtiersmod.TierTagFormatter;
import fr.tear.worldtiersmod.api.ModeInfo;
import net.minecraft.client.gui.DrawContext;
import net.minecraft.client.gui.screen.Screen;
import net.minecraft.client.gui.widget.ButtonWidget;
import net.minecraft.text.Text;

/** Menu WorldTiers léger, natif et sans navigateur intégré. */
public class WorldTiersMenuScreen extends Screen {
    private final Screen parent;

    public WorldTiersMenuScreen(Screen parent) {
        super(Text.literal("WorldTiers"));
        this.parent = parent;
    }

    @Override
    protected void init() {
        int buttonWidth = 142;
        int gap = 8;
        int startX = width / 2 - buttonWidth - gap / 2;
        int startY = 55;
        boolean autoSelected = WorldTiersModClient.DISPLAY_MODE.currentLabel().startsWith("Auto");

        addDrawableChild(ButtonWidget.builder(TierTagFormatter.modeButtonLabel("crystal", (autoSelected ? "✓ " : "") + "Auto — meilleur tier"), button -> {
            WorldTiersModClient.DISPLAY_MODE.selectAuto();
            close();
        }).dimensions(width / 2 - 100, 39, 200, 20).build());

        int index = 0;
        for (ModeInfo mode : WorldTiersModClient.DISPLAY_MODE.availableModes()) {
            int x = startX + (index % 2) * (buttonWidth + gap);
            int y = startY + (index / 2) * 24;
            boolean selected = WorldTiersModClient.DISPLAY_MODE.currentLabel().equals(mode.name());
            addDrawableChild(ButtonWidget.builder(TierTagFormatter.modeButtonLabel(mode.slug(), (selected ? "✓ " : "") + mode.name()), button -> {
                WorldTiersModClient.DISPLAY_MODE.selectMode(mode.slug());
                close();
            }).dimensions(x, y, buttonWidth, 20).build());
            index++;
        }

        addDrawableChild(ButtonWidget.builder(Text.literal("Top WorldTiers"), button ->
                client.setScreen(new WorldTiersTopScreen(this)))
                .dimensions(width / 2 - 100, startY + 128, 200, 20).build());
        addDrawableChild(ButtonWidget.builder(Text.literal("Rechercher un profil"), button ->
                client.setScreen(new WorldTiersSearchScreen(this)))
                .dimensions(width / 2 - 100, startY + 152, 200, 20).build());
        addDrawableChild(ButtonWidget.builder(Text.literal("Fermer"), button -> close())
                .dimensions(width / 2 - 50, startY + 176, 100, 20).build());
    }

    @Override
    public void close() {
        if (client != null) client.setScreen(parent);
    }

    @Override
    public void render(DrawContext context, int mouseX, int mouseY, float delta) {
        super.render(context, mouseX, mouseY, delta);
        context.drawCenteredTextWithShadow(textRenderer, TierTagFormatter.modeButtonLabel("crystal", "WORLD TIERS"), width / 2, 12, 0xFFFFFF);
        context.drawCenteredTextWithShadow(textRenderer, "Mode affiché : " + WorldTiersModClient.DISPLAY_MODE.currentLabel(), width / 2, 25, 0x72C6FF);
        context.drawCenteredTextWithShadow(textRenderer, "Top et profils peuvent être consultés sans être dans la partie.", width / 2, 34, 0xA7B4C6);
    }
}
