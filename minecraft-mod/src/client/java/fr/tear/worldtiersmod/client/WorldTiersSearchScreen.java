package fr.tear.worldtiersmod.client;

import net.minecraft.client.gui.DrawContext;
import net.minecraft.client.gui.screen.Screen;
import net.minecraft.client.gui.widget.ButtonWidget;
import net.minecraft.client.gui.widget.TextFieldWidget;
import net.minecraft.text.Text;

/** Recherche d'un profil public WorldTiers par pseudo Minecraft. */
public class WorldTiersSearchScreen extends Screen {
    private final Screen parent;
    private TextFieldWidget usernameField;
    private String hint = "Entre un pseudo Minecraft";

    public WorldTiersSearchScreen(Screen parent) {
        super(Text.literal("Rechercher un profil"));
        this.parent = parent;
    }

    @Override
    protected void init() {
        usernameField = new TextFieldWidget(textRenderer, width / 2 - 100, 72, 200, 20, Text.literal("Pseudo Minecraft"));
        usernameField.setMaxLength(16);
        usernameField.setFocused(true);
        addDrawableChild(usernameField);
        setInitialFocus(usernameField);

        addDrawableChild(ButtonWidget.builder(Text.literal("Voir le profil"), button -> openProfile())
                .dimensions(width / 2 - 100, 100, 200, 20).build());
        addDrawableChild(ButtonWidget.builder(Text.literal("Retour"), button -> close())
                .dimensions(width / 2 - 50, 128, 100, 20).build());
    }

    @Override
    public boolean keyPressed(net.minecraft.client.input.KeyInput input) {
        if (input.key() == org.lwjgl.glfw.GLFW.GLFW_KEY_ENTER || input.key() == org.lwjgl.glfw.GLFW.GLFW_KEY_KP_ENTER) {
            openProfile();
            return true;
        }
        return super.keyPressed(input);
    }

    private void openProfile() {
        String username = usernameField.getText().trim();
        if (!username.matches("[A-Za-z0-9_]{3,16}")) {
            hint = "Pseudo invalide : 3 à 16 caractères";
            return;
        }
        if (client != null) client.setScreen(new WorldTiersProfileScreen(this, username));
    }

    @Override
    public void close() {
        if (client != null) client.setScreen(parent);
    }

    @Override
    public void render(DrawContext context, int mouseX, int mouseY, float delta) {
        super.render(context, mouseX, mouseY, delta);
        context.drawCenteredTextWithShadow(textRenderer, "Recherche WorldTiers", width / 2, 28, 0xFFFFFF);
        context.drawCenteredTextWithShadow(textRenderer, hint, width / 2, 45, 0x8BC7FF);
    }
}
