#!/usr/bin/env python3
"""
gen-sitemap.py — genera sitemap.xml a partir de la llista de rutes indexables,
amb la data de darrera modificació real (mtime) de cada fitxer.

Font única de veritat per a les rutes públiques. Executa'l abans de desplegar
(o dins de build.sh) perquè el sitemap sempre reflecteixi els canvis reals.

    python3 gen-sitemap.py
"""

import os
from datetime import datetime, timezone

BASE = "https://nuclidigital.com/V5/"

# Rutes indexables: (fitxer, ruta pública, changefreq, priority)
ROUTES = [
    ("index.html",      "",                "monthly", "1.0"),
    ("legal.html",      "legal.html",      "yearly",  "0.3"),
    ("privacitat.html", "privacitat.html", "yearly",  "0.3"),
    ("sitemap.html",    "sitemap.html",    "monthly", "0.3"),
]


def lastmod(path):
    try:
        ts = os.path.getmtime(path)
        return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d")
    except OSError:
        return datetime.now(tz=timezone.utc).strftime("%Y-%m-%d")


def build():
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for fname, route, freq, prio in ROUTES:
        lines += [
            "  <url>",
            f"    <loc>{BASE}{route}</loc>",
            f"    <lastmod>{lastmod(fname)}</lastmod>",
            f"    <changefreq>{freq}</changefreq>",
            f"    <priority>{prio}</priority>",
            "  </url>",
        ]
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    xml = build()
    with open("sitemap.xml", "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"sitemap.xml generat amb {len(ROUTES)} rutes.")
