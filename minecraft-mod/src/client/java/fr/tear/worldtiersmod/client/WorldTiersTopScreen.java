package fr.tear.worldtiersmod.client;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import fr.tear.worldtiersmod.WorldTiersModClient;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.gui.DrawContext;
import net.minecraft.client.gui.screen.Screen;
import net.minecraft.client.gui.widget.ButtonWidget;
import net.minecraft.text.Text;

/** Classement public affiché directement dans Minecraft. */
public class WorldTiersTopScreen extends Screen {
    private final Screen parent;
    private ButtonWidget status;
    private final ButtonWidget[] rows = new ButtonWidget[8];

    public WorldTiersTopScreen(Screen parent) {
        super(Text.literal("Top WorldTiers"));
        this.parent = parent;
    }

    @Override
    protected void init() {
        status = addDrawableChild(ButtonWidget.builder(Text.literal("Chargement du Top WorldTiers..."), button -> {})
                .dimensions(width / 2 - 145, 34, 290, 20).build());
        status.active = false;
        for (int index = 0; index < rows.length; index++) {
            rows[index] = addDrawableChild(ButtonWidget.builder(Text.literal(""), button -> {})
                    .dimensions(width / 2 - 145, 60 + index * 18, 290, 16).build());
            rows[index].active = false;
        }
        addDrawableChild(ButtonWidget.builder(Text.literal("Retour"), button -> close())
                .dimensions(width / 2 - 50, height - 28, 100, 20).build());

        WorldTiersModClient.API.fetchTopPlayers().thenAccept(result -> MinecraftClient.getInstance().execute(() -> showTop(result)));
    }

    private void showTop(JsonArray players) {
        if (players == null || players.isEmpty()) {
            status.setMessage(Text.literal("Aucun joueur classé."));
            return;
        }
        status.setMessage(Text.literal("WORLD TIERS — TOP JOUEURS"));
        for (int index = 0; index < rows.length; index++) {
            if (index >= players.size()) {
                rows[index].visible = false;
                continue;
            }
            JsonObject player = players.get(index).getAsJsonObject();
            String name = player.has("username") ? player.get("username").getAsString() : "Inconnu";
            int points = player.has("points") ? player.get("points").getAsInt() : 0;
            int rank = player.has("rank") ? player.get("rank").getAsInt() : index + 1;
            rows[index].setMessage(Text.literal("#" + rank + "   " + name + "   |   " + points + " pts"));
        }
    }

    @Override
    public void close() {
        if (client != null) client.setScreen(parent);
    }

    @Override
    public void render(DrawContext context, int mouseX, int mouseY, float delta) {
        super.render(context, mouseX, mouseY, delta);
    }
}
