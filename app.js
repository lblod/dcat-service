// see https://github.com/mu-semtech/mu-javascript-template for more info

import { rdfSerializer } from "rdf-serialize";
import { queryDatabase } from "./app/data";
import { app, errorHandler } from "mu";

const acceptedFormats = [
  "application/ld+json",
  "application/n-quads",
  "application/n-triples",
  "application/trig",
  "text/n3",
  "text/turtle",
];

app.get("/*", async function (req, res, next) {
  try {
    const contentType = req.accepts(acceptedFormats);
    if (contentType) {
      res.header("Content-Type", contentType);
      const stream = rdfSerializer.serialize(await queryDatabase(), {
        contentType,
      });
      stream.pipe(res);
    } else {
      res.status(406).send(`unrecognized format ${req.headers.accept}`);
    }
  } catch (e) {
    next(e);
  }
});

app.use(errorHandler);
