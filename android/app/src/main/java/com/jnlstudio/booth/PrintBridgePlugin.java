package com.jnlstudio.booth;

import android.content.Intent;
import android.net.Uri;
import android.util.Base64;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;

@CapacitorPlugin(name = "PrintBridge")
public class PrintBridgePlugin extends Plugin {

    @PluginMethod
    public void printImage(PluginCall call) {
        String base64 = call.getString("base64");

        if (base64 == null || base64.isEmpty()) {
            call.reject("Image data is missing");
            return;
        }

        try {
            if (base64.contains(",")) {
                base64 = base64.substring(base64.indexOf(",") + 1);
            }

            byte[] imageBytes = Base64.decode(base64, Base64.DEFAULT);

            File printFile = new File(
                getActivity().getCacheDir(),
                "jnl-booth-print.jpg"
            );

            try (FileOutputStream outputStream = new FileOutputStream(printFile)) {
                outputStream.write(imageBytes);
                outputStream.flush();
            }

            Uri imageUri = FileProvider.getUriForFile(
                getActivity(),
                getActivity().getPackageName() + ".fileprovider",
                printFile
            );

            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType("image/jpeg");
            intent.putExtra(Intent.EXTRA_STREAM, imageUri);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            intent.setPackage("com.nokoprint");

            getActivity().startActivity(intent);

            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);

        } catch (Exception e) {
            call.reject("Unable to send photo to NokoPrint: " + e.getMessage());
        }
    }
}
