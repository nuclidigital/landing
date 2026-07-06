// ============================================================
// dnsconfig.js — configuració DNS declarativa per a nuclidigital.com
// (dnscontrol · https://docs.dnscontrol.org)
//
// Apunta el domini arrel i www a GitHub Pages, amb registres CAA per
// restringir qui pot emetre certificats TLS (defensa contra emissió
// no autoritzada). Adapta el registrar/provider al teu cas real.
//
//   dnscontrol preview     // mostra els canvis sense aplicar-los
//   dnscontrol push        // aplica els canvis
// ============================================================

var REG = NewRegistrar("none");
var DNS = NewDnsProvider("cloudflare"); // o el teu proveïdor DNS real

// IPs oficials de GitHub Pages (apex/arrel del domini)
var GHP_A = ["185.199.108.153", "185.199.109.153", "185.199.110.153", "185.199.111.153"];
var GHP_AAAA = ["2606:50c0:8000::153", "2606:50c0:8001::153", "2606:50c0:8002::153", "2606:50c0:8003::153"];

D("nuclidigital.com", REG, DnsProvider(DNS),

    // Arrel del domini → GitHub Pages (IPv4 + IPv6)
    A("@", GHP_A[0]),
    A("@", GHP_A[1]),
    A("@", GHP_A[2]),
    A("@", GHP_A[3]),
    AAAA("@", GHP_AAAA[0]),
    AAAA("@", GHP_AAAA[1]),
    AAAA("@", GHP_AAAA[2]),
    AAAA("@", GHP_AAAA[3]),

    // www → el teu usuari de GitHub Pages
    CNAME("www", "nuclidigital.github.io."),

    // Subdominis del laboratori (ajusta els targets reals)
    // CNAME("garden",   "nuclidigital.github.io."),
    // CNAME("glpi11",   "el-teu-target-glpi."),
    // CNAME("keycloak", "el-teu-target-keycloak."),

    // CAA: només Let's Encrypt (GitHub Pages) pot emetre certificats.
    // Endureix la cadena de confiança TLS del domini.
    CAA("@", "issue", "letsencrypt.org"),
    CAA("@", "issuewild", ";"),
    CAA("@", "iodef", "mailto:hola@nuclidigital.com"),

    // Correu: sense servidor de correu propi → política nul·la explícita
    // (evita spoofing del domini). Ajusta si tens correu real.
    TXT("@", "v=spf1 -all"),
    TXT("_dmarc", "v=DMARC1; p=reject; rua=mailto:hola@nuclidigital.com")
);
