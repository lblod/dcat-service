import jsstream from "stream";
import fs from "fs";
import { rdfParser, ParseOptions } from "rdf-parse";
import { rdfSerializer, SerializeOptions } from "rdf-serialize";

export function convert(
  file: string,
  opts: { parseOptions: ParseOptions; serializeOptions: SerializeOptions }
): NodeJS.ReadableStream {
  if (!fs.existsSync(file)) {
    throw Error(`File does not exist: ${file}`);
  }
  const fileStream = fs.createReadStream(file);
  const parsed: jsstream.Readable = rdfParser.parse(
    fileStream,
    opts.parseOptions
  );
  const serialized: NodeJS.ReadableStream = rdfSerializer.serialize(
    parsed,
    opts.serializeOptions
  );
  return serialized;
}
