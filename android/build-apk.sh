#!/usr/bin/env bash
# يبني APK موقَّعًا من dist/ دون Android Studio ولا Gradle:
# aapt2 (موارد) + javac + dx (بايت‌كود) + محاذاة + توقيع apksig. يحتاج JDK 17+ و python3 و curl.
set -euo pipefail
cd "$(dirname "$0")"
VERSION=$(node -p "require('../package.json').version"); CODE=${VERSION_CODE:-1}
T=.tools; B=build; mkdir -p $T; rm -rf $B; mkdir -p $B/classes $B/assets
get() { [ -s "$T/$1" ] || { echo "↓ $1"; curl -fsSL --retry 3 -o "$T/$1" "$2"; }; }
get android.jar https://raw.githubusercontent.com/Sable/android-platforms/master/android-34/android.jar
get aapt2 https://raw.githubusercontent.com/iBotPeaches/Apktool/main/brut.apktool/apktool-lib/src/main/resources/prebuilt/linux/aapt2
get dx.jar https://repo.maven.apache.org/maven2/com/jakewharton/android/repackaged/dalvik-dx/16.0.1/dalvik-dx-16.0.1.jar
get apksig.jar https://repo.maven.apache.org/maven2/com/android/tools/build/apksig/${APKSIG:-2.3.0}/apksig-${APKSIG:-2.3.0}.jar
chmod +x $T/aapt2
[ -f ../dist/index.html ] || { echo "شغّل أولًا: npm run build"; exit 1; }
cp -r ../dist $B/assets/www

$T/aapt2 compile --dir res -o $B/res.zip
$T/aapt2 link -o $B/unaligned.apk -I $T/android.jar --manifest AndroidManifest.xml -A $B/assets \
  --min-sdk-version 24 --target-sdk-version 34 --version-code "$CODE" --version-name "$VERSION" $B/res.zip
javac -nowarn -Xlint:-options --release 8 -cp $T/android.jar -d $B/classes $(find src -name '*.java')
java -cp $T/dx.jar com.android.dx.command.Main --dex --min-sdk-version=24 --output=$B/classes.dex $B/classes
(cd $B && zip -qj unaligned.apk classes.dex)
python3 tools/zipalign.py $B/unaligned.apk $B/aligned.apk

# مفتاح التوقيع: ضع مفتاحك في android/release.p12 (أو KEYSTORE=...) ليبقى التحديث ممكنًا فوق النسخة المثبتة.
KS=${KEYSTORE:-release.p12}; PASS=${KEYSTORE_PASS:-mashhadaya}; ALIAS=${KEY_ALIAS:-mashhadaya}
[ -f "$KS" ] || keytool -genkeypair -keystore "$KS" -storetype PKCS12 -storepass "$PASS" -alias "$ALIAS" \
  -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Mashhadaya" >/dev/null 2>&1
javac -nowarn -cp $T/apksig.jar -d $B/sign tools/Sign.java
mkdir -p ../release; OUT=../release/Mashhadaya-Android-$VERSION.apk
java --add-exports java.base/sun.security.x509=ALL-UNNAMED --add-exports java.base/sun.security.pkcs=ALL-UNNAMED --add-opens java.base/sun.security.x509=ALL-UNNAMED -cp $T/apksig.jar:$B/sign Sign $B/aligned.apk "$OUT" "$KS" "$ALIAS" "$PASS"
echo "built $OUT ($(du -h "$OUT" | cut -f1))"
