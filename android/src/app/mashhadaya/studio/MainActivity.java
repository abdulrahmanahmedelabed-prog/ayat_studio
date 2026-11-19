package app.mashhadaya.studio;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/** غلاف أندرويد: WebView يعرض ملفات التطبيق المضمَّنة في assets/www عبر أصل https محلي. */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.mashhadaya.app";
    private WebView web;
    private WebChromeClient chrome;
    private View fullView;
    private WebChromeClient.CustomViewCallback fullCallback;

    private static String mime(String p) {
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".js")) return "text/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".json") || p.endsWith(".webmanifest")) return "application/json";
        if (p.endsWith(".svg")) return "image/svg+xml";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".woff2")) return "font/woff2";
        if (p.endsWith(".woff")) return "font/woff";
        return "application/octet-stream";
    }

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        web.setBackgroundColor(0xFF0B1417);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false); // لتبدأ التلاوة مع المشهد مباشرة
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if (!HOST.equals(u.getHost())) return null;
                String p = u.getPath();
                if (p == null || p.equals("/")) p = "/app.html";
                if (p.contains("..")) p = "/app.html";
                String m = mime(p);
                boolean text = m.startsWith("text/") || m.contains("json") || m.contains("svg");
                try {
                    return new WebResourceResponse(m, text ? "utf-8" : null, getAssets().open("www" + p));
                } catch (IOException e) {
                    Map<String, String> h = new HashMap<String, String>();
                    return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", h, new ByteArrayInputStream(new byte[0]));
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                if (HOST.equals(r.getUrl().getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, r.getUrl())); } catch (Exception ignored) { }
                return true;
            }
        });
        chrome = new WebChromeClient() {
            @Override
            public void onShowCustomView(View view, CustomViewCallback cb) {
                if (fullView != null) { cb.onCustomViewHidden(); return; }
                fullView = view; fullCallback = cb;
                ((FrameLayout) getWindow().getDecorView()).addView(view, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
            }

            @Override
            public void onHideCustomView() {
                if (fullView == null) return;
                ((FrameLayout) getWindow().getDecorView()).removeView(fullView);
                fullView = null;
                getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
                if (fullCallback != null) fullCallback.onCustomViewHidden();
                fullCallback = null;
            }
        };
        web.setWebChromeClient(chrome);
        setContentView(web);
        if (state != null) web.restoreState(state); else web.loadUrl("https://" + HOST + "/app.html");
    }

    @Override
    protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }

    @Override
    public void onBackPressed() {
        if (fullView != null) { chrome.onHideCustomView(); return; }
        if (web.canGoBack()) web.goBack(); else super.onBackPressed();
    }

    @Override
    protected void onPause() { super.onPause(); web.onPause(); }

    @Override
    protected void onResume() { super.onResume(); web.onResume(); }
}
