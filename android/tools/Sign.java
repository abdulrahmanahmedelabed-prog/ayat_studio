import com.android.apksig.ApkSigner;
import java.io.File;
import java.io.FileInputStream;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.Collections;

/** توقيع APK (v2 — يكفي لأندرويد 7 فأحدث) بمكتبة apksig. الاستعمال: Sign in.apk out.apk keystore alias password */
public class Sign {
    public static void main(String[] a) throws Exception {
        KeyStore ks = KeyStore.getInstance("PKCS12");
        try (FileInputStream in = new FileInputStream(a[2])) { ks.load(in, a[4].toCharArray()); }
        PrivateKey key = (PrivateKey) ks.getKey(a[3], a[4].toCharArray());
        X509Certificate cert = (X509Certificate) ks.getCertificate(a[3]);
        ApkSigner.SignerConfig cfg = new ApkSigner.SignerConfig.Builder("mashhadaya", key, Collections.singletonList(cert)).build();
        new ApkSigner.Builder(Collections.singletonList(cfg)).setInputApk(new File(a[0])).setOutputApk(new File(a[1]))
            .setV1SigningEnabled(false).setV2SigningEnabled(true).setMinSdkVersion(24).build().sign();
    }
}
