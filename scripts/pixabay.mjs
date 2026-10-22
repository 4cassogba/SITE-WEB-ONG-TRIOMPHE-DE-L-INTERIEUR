// Recherche et téléchargement d'images et de vidéos libres de droits Pixabay,
// pour le blog et le B-roll. La clé vient de PIXABAY_API_KEY (.env.local, jamais
// commitée). Les conditions de Pixabay interdisent d'afficher les fichiers depuis
// leurs serveurs : on les télécharge dans public/ et on les sert nous-mêmes.
//
//   node scripts/pixabay.mjs search "african woman tired" [--video] [--n 12]
//   node scripts/pixabay.mjs get <id> public/images/blog/xxx.jpg [--video]
//
// La licence Pixabay n'exige pas de crédit ; on l'indique quand même en légende
// (« Photo : <auteur> / Pixabay »), c'est plus honnête pour le lecteur.
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import sharp from "sharp";

dotenv.config({ path: ".env.local", quiet: true });
const KEY = process.env.PIXABAY_API_KEY;
if (!KEY) {
  console.error("PIXABAY_API_KEY manquante dans .env.local");
  process.exit(1);
}

const [cmd, ...rest] = process.argv.slice(2);
const flag = (name) => rest.includes(`--${name}`);
const option = (name, fallback) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 && rest[i + 1] ? rest[i + 1] : fallback;
};
const positional = rest.filter((a, i) => !a.startsWith("--") && !(i > 0 && rest[i - 1] === "--n"));
const isVideo = flag("video");
const endpoint = isVideo ? "https://pixabay.com/api/videos/" : "https://pixabay.com/api/";

async function api(params) {
  const q = new URLSearchParams({ key: KEY, safesearch: "true", ...params });
  const res = await fetch(`${endpoint}?${q}`);
  if (!res.ok) throw new Error(`Pixabay HTTP ${res.status} : ${await res.text()}`);
  return res.json();
}

if (cmd === "search") {
  const query = positional[0];
  if (!query) throw new Error('Usage : search "requête" [--video] [--n 12]');
  const data = await api({ q: query, per_page: option("n", "12"), ...(isVideo ? {} : { image_type: "photo" }), lang: "fr" });
  console.log(`${data.totalHits} résultats pour « ${query} »${isVideo ? " (vidéos)" : ""}`);
  for (const h of data.hits) {
    const size = isVideo ? `${h.duration}s ${h.videos.large?.width ?? h.videos.medium.width}x${h.videos.large?.height ?? h.videos.medium.height}` : `${h.imageWidth}x${h.imageHeight}`;
    const preview = isVideo ? h.videos.tiny.thumbnail : h.previewURL;
    console.log(`${h.id}\t${size}\t${h.user}\t${h.tags}\n\t${preview}`);
  }
} else if (cmd === "get") {
  const [id, dest] = positional;
  if (!id || !dest) throw new Error("Usage : get <id> <fichier de destination> [--video]");
  const data = await api({ id });
  const hit = data.hits[0];
  if (!hit) throw new Error(`Aucun élément ${id}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (isVideo) {
    const file = hit.videos.large?.url ? hit.videos.large : hit.videos.medium;
    const buf = Buffer.from(await (await fetch(file.url)).arrayBuffer());
    fs.writeFileSync(dest, buf);
    console.log(`vidéo ${file.width}x${file.height}, ${Math.round(buf.length / 1024)} Ko → ${dest}`);
  } else {
    const buf = Buffer.from(await (await fetch(hit.largeImageURL)).arrayBuffer());
    // 1600 px de large suffisent pour un bandeau plein écran ; JPEG optimisé.
    await sharp(buf).resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(dest);
    const m = await sharp(dest).metadata();
    console.log(`photo ${m.width}x${m.height}, ${Math.round(fs.statSync(dest).size / 1024)} Ko → ${dest}`);
  }
  console.log(`Crédit : ${isVideo ? "Vidéo" : "Photo"} : ${hit.user} / Pixabay (${hit.pageURL})`);
} else {
  console.log('Commandes : search "requête" [--video] [--n 12] | get <id> <destination> [--video]');
}
