// see https://github.com/mu-semtech/mu-javascript-template for more info

import init from "./app/init";
import { convert } from "./app/reader";
import { app, errorHandler } from "mu";

const targetGraph = "https://example.org/graphs/dcat";
const filePath = "./config/dcat.ttl";
const baseIRI = "https://example.org/";
const acceptedFormats = [
  "application/ld+json",
  "application/n-quads",
  "application/n-triples",
  "application/trig",
  "text/n3",
  "text/turtle",
];

app.get("/*", function (req, res, next) {
  try {
    const contentType = req.accepts(acceptedFormats);
    if (contentType === undefined) {
      res.status(406).send(`unrecognized format ${req.headers.accept}`);
    } else {
      res.header("Content-Type", contentType);
      const stream = convert(filePath, {
        parseOptions: { contentType: "text/turtle", baseIRI },
        serializeOptions: { contentType },
      });
      stream.pipe(res);
    }
  } catch (e) {
    next(e);
  }
});

app.use(errorHandler);

await init(filePath, baseIRI, targetGraph);
