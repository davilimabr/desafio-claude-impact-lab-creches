// Leitor mínimo de .xlsx usando só a stdlib do Node.
// Um .xlsx é um ZIP de XML; aqui lemos o ZIP na mão (central directory + inflateRaw)
// e extraímos as células das abas. Evita a dependência `xlsx` do npm.

import { readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

const SIG_EOCD = 0x06054b50;
const SIG_CENTRAL = 0x02014b50;

/** Lê um ZIP e devolve Map<nomeDoArquivo, Buffer>. */
export function lerZip(caminho) {
  const buf = readFileSync(caminho);

  // O End Of Central Directory fica no fim; varre de trás pra frente
  // (o comentário do zip pode empurrar até 64 KB).
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === SIG_EOCD) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error(`ZIP inválido (EOCD não encontrado): ${caminho}`);

  const totalEntradas = buf.readUInt16LE(eocd + 10);
  let ptr = buf.readUInt32LE(eocd + 16);

  const arquivos = new Map();
  for (let n = 0; n < totalEntradas; n++) {
    if (buf.readUInt32LE(ptr) !== SIG_CENTRAL) break;

    const metodo = buf.readUInt16LE(ptr + 10);
    const tamComprimido = buf.readUInt32LE(ptr + 20);
    const tamNome = buf.readUInt16LE(ptr + 28);
    const tamExtra = buf.readUInt16LE(ptr + 30);
    const tamComentario = buf.readUInt16LE(ptr + 32);
    const offsetLocal = buf.readUInt32LE(ptr + 42);
    const nome = buf.toString("utf8", ptr + 46, ptr + 46 + tamNome);

    // O cabeçalho local repete nome/extra com tamanhos possivelmente diferentes:
    // é dali que sai o offset real dos dados.
    const nomeLocal = buf.readUInt16LE(offsetLocal + 26);
    const extraLocal = buf.readUInt16LE(offsetLocal + 28);
    const inicio = offsetLocal + 30 + nomeLocal + extraLocal;
    const bruto = buf.subarray(inicio, inicio + tamComprimido);

    arquivos.set(nome, metodo === 0 ? bruto : inflateRawSync(bruto));
    ptr += 46 + tamNome + tamExtra + tamComentario;
  }
  return arquivos;
}

function decodificarEntidades(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/&amp;/g, "&");
}

/** "BC12" -> 54 (índice de coluna base 0) */
function indiceColuna(ref) {
  let n = 0;
  for (const ch of ref.replace(/\d/g, "")) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function lerSharedStrings(xml) {
  if (!xml) return [];
  const out = [];
  for (const bloco of xml.toString("utf8").split("<si>").slice(1)) {
    const partes = [...bloco.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1]);
    out.push(decodificarEntidades(partes.join("")));
  }
  return out;
}

/**
 * Lê uma aba e devolve array de linhas, cada uma array de strings por coluna.
 * @param {string} caminhoXlsx
 * @param {number} numeroAba 1-based, na ordem do workbook
 */
export function lerAba(caminhoXlsx, numeroAba) {
  const zip = lerZip(caminhoXlsx);
  const compartilhadas = lerSharedStrings(zip.get("xl/sharedStrings.xml"));
  const alvo = zip.get(`xl/worksheets/sheet${numeroAba}.xml`);
  if (!alvo) throw new Error(`aba ${numeroAba} não encontrada em ${caminhoXlsx}`);

  const linhas = [];
  for (const bloco of alvo.toString("utf8").split("<row ").slice(1)) {
    const linha = [];
    const celulas = bloco.matchAll(/<c r="([A-Z]+\d+)"([^>]*)(?:\/>|>([\s\S]*?)<\/c>)/g);
    for (const [, ref, atributos, conteudo] of celulas) {
      if (!conteudo) continue;
      const tipo = /t="([^"]+)"/.exec(atributos)?.[1];
      let valor;
      if (tipo === "inlineStr") {
        valor = [...conteudo.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1]).join("");
        valor = decodificarEntidades(valor);
      } else {
        const bruto = /<v>([\s\S]*?)<\/v>/.exec(conteudo)?.[1];
        if (bruto === undefined) continue;
        valor = tipo === "s" ? compartilhadas[+bruto] : decodificarEntidades(bruto);
      }
      linha[indiceColuna(ref)] = valor;
    }
    linhas.push(linha);
  }
  return linhas;
}
