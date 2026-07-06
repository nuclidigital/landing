#!/usr/bin/env bash
# build.sh — pipeline de desplegament per a NucliDigital V5.
#
# Regenera els assets minificats, hi aplica cache-busting (hash de contingut)
# i actualitza el sitemap.xml. Requereix esbuild i python3.
#
#   npm install -g esbuild
#   ./build.sh
#
# Nota: els fonts llegibles de CSS/JS són a l'historial de git. Recupera'ls,
# edita'ls i executa aquest script abans de desplegar.

set -euo pipefail

echo "▸ 1/3 · Minificant CSS i JS…"
for f in styles.css brand-motion.css; do
    if [ -f "$f" ]; then
        esbuild "$f" --minify --legal-comments=none --outfile="$f.tmp" && mv "$f.tmp" "$f"
        echo "   ✓ $f"
    fi
done
for f in app.js consent.js backzone.js site-map.js; do
    if [ -f "$f" ]; then
        esbuild "$f" --minify-syntax --minify-whitespace --legal-comments=none --outfile="$f.tmp" && mv "$f.tmp" "$f"
        echo "   ✓ $f"
    fi
done

echo "▸ 2/3 · Aplicant cache-busting (hash de contingut)…"
python3 - <<'PY'
import hashlib, re, glob
assets = ['styles.css', 'brand-motion.css', 'app.js', 'consent.js', 'backzone.js', 'site-map.js']
assets += glob.glob('fonts/*.woff2')
ver = {a: hashlib.sha1(open(a, 'rb').read()).hexdigest()[:8] for a in assets}
for page in glob.glob('*.html'):
    s = open(page).read()
    for a, h in ver.items():
        s = re.sub(r'((?:href|src)=")([^"]*/)?' + re.escape(a) + r'(?:\?v=[a-f0-9]+)?(")',
                   lambda m, a=a, h=h: m.group(1) + (m.group(2) or '') + a + '?v=' + h + m.group(3), s)
    open(page, 'w').write(s)
print("   ✓ hash aplicat a totes les pàgines")
PY

echo "▸ 3/3 · Generant sitemap.xml…"
python3 gen-sitemap.py | sed 's/^/   /'

echo "✓ Build complet. Assets llestos per desplegar."
