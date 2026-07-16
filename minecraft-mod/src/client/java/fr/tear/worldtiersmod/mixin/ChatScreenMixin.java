package fr.tear.worldtiersmod.mixin;

import fr.tear.worldtiersmod.WorldTiersModClient;
import net.minecraft.client.gui.screen.ChatScreen;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/** Intercepte les commandes WorldTiers avant leur envoi au serveur. */
@Mixin(ChatScreen.class)
public class ChatScreenMixin {
    @Inject(method = "sendMessage", at = @At("HEAD"), cancellable = true)
    private void worldtiers$handleCommand(String message, boolean addToHistory, CallbackInfo ci) {
        if (WorldTiersModClient.handleChatCommand(message)) {
            ci.cancel();
        }
    }
}
