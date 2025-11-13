import jsstream from "stream";
import fs from "fs";
import { rdfParser, ParseOptions } from "rdf-parse";
import { rdfSerializer, SerializeOptions } from "rdf-serialize";

export function parse(file: string, opts: ParseOptions): jsstream.Readable {
  if (!fs.existsSync(file)) {
    throw Error(`File does not exist: ${file}`);
  }
  const fileStream = fs.createReadStream(file);
  return rdfParser.parse(
    fileStream,
    opts
  );
}

export function serialize(stream: jsstream.Readable, opts: SerializeOptions): NodeJS.ReadableStream {
  const serialized: NodeJS.ReadableStream = rdfSerializer.serialize(
    stream,
    opts
  );
  return serialized;
}

export function convert(
  file: string,
  opts: { parseOptions: ParseOptions; serializeOptions: SerializeOptions }
): NodeJS.ReadableStream {
  return serialize(parse(file, opts.parseOptions), opts.serializeOptions);
}