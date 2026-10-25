// Tells Bing, Yandex, Seznam and other IndexNow engines about every page in the
// live sitemap, so new and updated pages are crawled within minutes.
// Run after a deploy that adds or changes pages:  node scripts/indexnow.mjs
// The key file lives at public/<key>.txt and must stay published.

import { readdirSync } from "node:fs";

const HOST = "sellsail.io";
const keyFile = readdirSync(new URL("../public/", import.meta.url)).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error("No IndexNow key file in public/");
const key = keyFile.replace(".txt", "");

const sitemap = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${keyFile}`, urlList }),
});
console.log(`IndexNow: submitted ${urlList.length} URLs, response ${res.status} ${res.statusText}`);
