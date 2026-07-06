# NucliDigital V5 — Codi font (source)

Aquest paquet conté els **fitxers font sense minimitzar** del lloc, pensats per
editar-los còmodament. El CSS i el JS estan formatats i comentats; el lloc que
es desplega a producció, en canvi, serveix versions **minificades** amb
*cache-busting* (hash de contingut a `?v=…`).

> El paquet `nuclidigital-v5-complet.zip` (a part) conté ja la versió LLESTA PER
> DESPLEGAR (minificada). Aquest `source.zip` és per treballar-hi.

---

## Estructura

```
nuclidigital-v5-source/
├── index.html, legal.html, privacitat.html, sitemap.html, 404.html,
│   logo-animation.html      ← pàgines (sense ?v= als enllaços d'assets)
├── styles.css               ← full d'estils principal (formatat)
├── brand-motion.css         ← animació del logo N→Δ (formatat)
├── app.js                   ← menú, scrollspy, header, reveal (formatat)
├── consent.js               ← gestor de consentiment RGPD (font comentada)
├── backzone.js              ← modal protegit Backzone (font comentada)
├── site-map.js              ← generador del mapa del web (formatat)
├── gen-sitemap.py           ← genera sitemap.xml amb lastmod real
├── build.sh                 ← pipeline: minifica + cache-bust + sitemap
├── dnsconfig.js             ← configuració DNS (dnscontrol)
├── CNAME                    ← domini propi per a GitHub Pages
├── fonts/                   ← fonts variables subsetejades (.woff2)
└── (imatges .webp, favicons, manifest.json, robots.txt, security.txt…)
```

---

## Requisits

- **Node.js** (per a esbuild) i **Python 3** (per al sitemap).
- Instal·la esbuild globalment un sol cop:

  ```bash
  npm install -g esbuild
  ```

  > `esbuild` és el minificador triat perquè preserva CSS modern com
  > `@starting-style` (que altres, com clean-css, destrueixen).

---

## Minimitzar per desplegar

Tens dues opcions:

### Opció A — script tot-en-un (recomanat)

Executa el `build.sh` inclòs. Fa tres passos: minifica CSS/JS, aplica
*cache-busting* (hash de contingut) a totes les pàgines i regenera `sitemap.xml`.

```bash
chmod +x build.sh
./build.sh
```

### Opció B — comandes manuals

Si prefereixes control pas a pas:

```bash
# 1) Minificar cada CSS i JS in-place
esbuild styles.css       --minify --legal-comments=none --outfile=styles.css
esbuild brand-motion.css --minify --legal-comments=none --outfile=brand-motion.css
esbuild app.js           --minify-syntax --minify-whitespace --legal-comments=none --outfile=app.js
esbuild consent.js       --minify-syntax --minify-whitespace --legal-comments=none --outfile=consent.js
esbuild backzone.js      --minify-syntax --minify-whitespace --legal-comments=none --outfile=backzone.js
esbuild site-map.js      --minify-syntax --minify-whitespace --legal-comments=none --outfile=site-map.js

# 2) Aplicar cache-busting: afegir ?v=<hash> als enllaços d'assets.
#    (build.sh ho fa automàticament; manualment, edita els <link>/<script>
#     de cada .html afegint ?v=XXXX amb un hash curt del fitxer.)

# 3) Regenerar el sitemap amb dates reals
python3 gen-sitemap.py
```

---

## Fonts (opcional, ja fet)

Les fonts a `fonts/` ja estan **subsetejades** per rang d'eixos (Fraunces a
`wght 400-650` i `opsz 40-144`; JetBrains Mono i Public Sans amb el seu rang
real). Si les regeneres des de les originals, fes servir `fonttools`:

```bash
pip install fonttools brotli --break-system-packages
python3 -c "
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
f = TTFont('fraunces-original.ttf')
instantiateVariableFont(f, {'wght': (400, 650), 'opsz': (40, 144)}, inplace=True)
f.flavor = 'woff2'; f.save('fonts/fraunces-var.woff2')
"
```

Recorda mantenir els rangs de `font-weight` als `@font-face` de `styles.css`
sincronitzats amb els rangs reals de les fonts.

---

## Provar en local

Sempre amb un servidor HTTP (mai obrint el fitxer amb `file://`, perquè la CSP
bloqueja els scripts en aquest esquema):

```bash
python3 -m http.server 8000
# obre http://localhost:8000
```

---

## Desplegar a GitHub Pages

1. Puja el contingut (ja minificat) al repositori.
2. `CNAME`, `404.html`, `robots.txt`, `sitemap.xml` van a l'**arrel** del repo.
3. `security.txt` va a `/.well-known/security.txt`.
4. A **Settings → Pages**: configura el domini propi i marca **Enforce HTTPS**.
5. Posa el teu ID de Google Analytics a `consent.js` (o deixa'l buit i no carrega res).

Consulta `SEGURETAT.md` per als detalls de seguretat i DNS.

---

## Canviar la contrasenya de Backzone

El modal Backzone compara el hash SHA-256 de la contrasenya. Per canviar-la,
genera el hash de la nova i substitueix `PASSWORD_HASH` a `backzone.js`.
A la consola del navegador:

```js
crypto.subtle.digest("SHA-256", new TextEncoder().encode("la-teva-nova-clau"))
  .then(b => console.log(Array.from(new Uint8Array(b))
    .map(x => x.toString(16).padStart(2, "0")).join("")));
```

> La contrasenya per defecte és `nucli-backzone-2026`. Recorda que aquest gate
> és una barrera lleugera del costat del client, no seguretat forta.
