import { update, sparqlEscapeUri } from "mu";
import { convert } from "./reader";
import { text } from "stream/consumers";

export default async function init(filePath: string, baseIRI: string, graph: string) {
  const data = convert(filePath, {
    parseOptions: { contentType: "text/turtle", baseIRI },
    serializeOptions: { contentType: "text/n3" },
  })
  return await update(
    `
    DELETE {
      GRAPH ${sparqlEscapeUri(graph)} {
        ?s ?p ?o.
      }
    }
    INSERT {
      GRAPH ${sparqlEscapeUri(graph)} {
        ${text(data)}
      }
    }
    WHERE {
      GRAPH ${sparqlEscapeUri(graph)} {
       ?s ?p ?o.
      }
    }
  `,
    null
  );
}
