import fs from "node:fs";
import path from "node:path";
import { Font } from "@react-pdf/renderer";

let registered = false;

export function registerJapaneseFont() {
  if (registered) return;

  const fontPath = path.join(process.cwd(), "src/assets/fonts/ipag.ttf");
  const buffer = fs.readFileSync(fontPath);
  const dataUrl = `data:font/ttf;base64,${buffer.toString("base64")}`;

  Font.register({
    family: "NotoSansJP",
    src: dataUrl,
  });

  registered = true;
}
