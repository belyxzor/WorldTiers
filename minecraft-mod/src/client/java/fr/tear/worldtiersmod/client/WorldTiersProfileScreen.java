package fr.tear.worldtiersmod.client;

import com.google.gson.JsonObject;
import fr.tear.worldtiersmod.WorldTiersModClient;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.gui.DrawContext;
import net.minecraft.client.gui.screen.Screen;
import net.minecraft.client.gui.widget.ButtonWidget;
import net.minecraft.text.Text;

/** Profil public WorldTiers affiché directement dans Minecraft. */
public class WorldTiersProfileScreen extends Screen {
    private final Screen parent;
    private final String requestedUsername;
    private ButtonWidget status;
    private ButtonWidget summary;
    private ButtonWidget tiers;

    public WorldTiersProfileScreen(Screen parent, String username) {
        super(Text.literal("Profil WorldTiers"));
        this.parent = parent;
        this.requestedUsername = username;
    }

    @Override
    protected void init() {
        status = addDrawableChild(ButtonWidget.builder(Text.literal("Chargement de " + requestedUsername + "..."), button -> {})
                .dimensions(width / 2 - 145, 42, 290, 20).build());
        status.active = false;
        summary = addDrawableChild(ButtonWidget.builder(Text.literal(""), button -> {})
                .dimensions(width / 2 - 145, 68, 290, 20).build());
        summary.active = false;
        tiers = addDrawableChild(ButtonWidget.builder(Text.literal(""), button -> {})
                .dimensions(width / 2 - 145, 94, 290, 20).build());
        tiers.active = false;
        addDrawableChild(ButtonWidget.builder(Text.literal("Retour"), button -> close())
                .dimensions(width / 2 - 50, height - 28, 100, 20).build());

        WorldTiersModClient.API.fetchProfile(requestedUsername).thenAccept(result -> MinecraftClient.getInstance().execute(() -> showProfile(result)));
    }

    private void showProfile(JsonObject profile) {
        if (profile == null) {
            status.setMessage(Text.literal("Profil introuvable : " + requestedUsername));
            return;
        }
        String username = profile.has("username") ? profile.get("username").getAsString() : requestedUsername;
        int points = profile.has("points") ? profile.get("points").getAsInt() : 0;
        String region = profile.has("region") ? profile.get("region").getAsString() : "?";
        int rank = profile.has("rank") ? profile.get("rank").getAsInt() : 0;
        status.setMessage(Text.literal(username + " — Profil WorldTiers"));
        summary.setMessage(Text.literal("#" + rank + "  •  " + points + " points  •  " + region));
        StringBuilder values = new StringBuilder("Tiers : ");
        if (profile.has("tiers") && profile.get("tiers").isJsonObject()) {
            for (var entry : profile.getAsJsonObject("tiers").entrySet()) {
                if (values.length() > 7) values.append("  |  ");
                values.append(entry.getKey()).append(' ').append(entry.getValue().getAsString());
            }
        }
        if (values.length() == 7) values.append("aucun tier");
        tiers.setMessage(Text.literal(values.toString()));
    }

    @Override
    public void close() {
        if (client != null) client.setScreen(parent);
    }

    @Override
    public void render(DrawContext context, int mouseX, int mouseY, float delta) {
        super.render(context, mouseX, mouseY, delta);
        context.drawCenteredTextWithShadow(textRenderer, "WORLD TIERS — STATISTIQUES JOUEUR", width / 2, 18, 0xFFFFFF);
    }
}
