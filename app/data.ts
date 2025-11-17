import { Readable } from "stream";
import { SparqlJsonParser } from "sparqljson-parse";
import { query } from "mu";
import * as RDF from "@rdfjs/types";
import dataFactory from "@rdfjs/data-model";

class ArrayQuadStream extends Readable implements RDF.Stream<RDF.Quad> {
  private data: RDF.Quad[];

  constructor(quads: RDF.Quad[]) {
    super({ objectMode: true });
    this.data = quads;
  }
  _read() {
    this.push(this.data.shift() || null);
  }
}

export async function queryDatabase(): Promise<RDF.Stream<RDF.Quad>> {
  // Alternative approach is to use `query()` with the `Accept` header set to `text/turtle`,
  // and then use `rdf-parse`, but that would require patching `mu-javascript-template`, cf.
  // <https://github.com/mu-semtech/mu-javascript-template/blob/e7a270549a8fcdfaf0c24235751a9df8f9e40672/helpers/mu/sparql.js#L15>
  const sparqlJsonResponse = await query(
    `
    PREFIX cms: <http://mu.semte.ch/vocabulary/cms/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX dcat: <http://www.w3.org/ns/dcat#>
    CONSTRUCT {
      ?subject ?predicate ?object.
    } WHERE {
      {
        ?subject a dcat:Catalogue.
      } UNION {
        ?subject a dcat:Dataset.
      } UNION {
        ?subject a dcat:Distribution.
      } UNION {
        [] a dcat:Catalogue;
          dct:publisher|
          dcat:themeTaxonomy|
          dcat:record|
          dcat:dataset|
          dcat:theme|
          dcat:record ?subject.
      } UNION {
        [] a dcat:Distribution;
          dct:format/cms:page? ?subject.
      }
      ?subject ?predicate ?object.
    }
  `);

  // Since we just get a single response, we parse everything into an array of quads and make a stream out of it after the fact.
  const parser = new SparqlJsonParser();
  const quads = parser
    .parseJsonResults(sparqlJsonResponse)
    .map((binding) =>
      dataFactory.quad(
        binding["s"] as RDF.Quad_Subject,
        binding["p"] as RDF.Quad_Predicate,
        binding["o"] as RDF.Quad_Object,
        dataFactory.defaultGraph()
      )
    );
  return new ArrayQuadStream(quads);
}
