# dcat-service

This service provides an endpoint that presents DCAT catalogues, datasets and distributions in a Linked Data file format of the user's choice.

## Adding datasets

Adding a dataset to the database is a matter of inserting triples conforming to the [DCAT](https://www.w3.org/TR/vocab-dcat-3/) specification. The triples can be added through the `migrations` service.  A dataset can be private or publicly available, and it can be distributed in multiple formats. An example can be found in [`example.ttl`](example.ttl).

## Adding to a stack

To add the service to a mu-semtech stack, add the following snippet to its `docker-compose.yaml` file in the `services` section:

```yaml
dcat:
  image: lblod/dcat-service:0.0.1
  environment:
    BASE_URL: "https://the-base-url-of-the-app"
```

Add the following routes to the dispatcher's configuration. Note if you have set the environment value `DSP_PATH_PREFIX` to a different value than its default one, be sure to change the corresponding parts in the DSP rule accordingly.

```elixir
match "/dcat/*path" do
  Proxy.forward(conn, path, "http://dcat/")
end

match "/dsp/2025-1/catalog/*path", %{ accept: [:json], layer: :api_services} do
  Proxy.forward conn, path, "http://dcat/dsp/2025-1/catalog/"
end
```

## Configuration

### Environment variables

| Name            | Description                                                                                  | Required | Default value                                   |
|-----------------|----------------------------------------------------------------------------------------------|----------|-------------------------------------------------|
| BASE_URL        | The base URL of the application.                                                             | Yes      | None                                            |
| DSP_SERVICE_ID  | The unique ID with which this service is known in the dataspace.                             | Yes      | None                                            |
| DSP_PATH_PREFIX | A prefix that is added to all DSP routes between the base URL and the DSP protocol endpoint. | No       | `/dsp/2025-1/`                                  |
| DSP_CONTEXT     | The JSON-LD context used for message bodies.                                                 | No       | "https://w3id.org/dspace/2025/1/context.jsonld" |

## API

### `GET /catalogs`

This endpoint passes all information on `dcat:Catalog`s, `dcat:Dataset`s and `dcat:Distribution`s from the triple store to the user. The specific file format can be specified via the `Accept` HTTP header, with the default being `application/ld+json`. The following formats are currently supported:

- `application/ld+json`
- `application/n-quads`
- `application/n-triples`
- `application/trig`
- `text/n3`
- `text/turtle`

#### Response

- `200 OK` if the data was successfully sent to the user.
- `406 Not Acceptable` if the requested file format is not supported.

### Dataspace Protocol (DSP)
The following endpoints implement the [Dataspace Protocol DSP](https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/).

> [!warning]
> For this service to work correctly there should be **no** cyclic links between the relevant data resources. If there are such cyclic links, for example a catalog (indirectly) contains its parent catalog, this service's behavior will be unpredictable

> [!warning]
> In DSP the data service for a catalog or dataset should always be the participant implementing DSP's contract negotiation protocol. This will be this same service, therefore any returned data service always points to the service itself. Any data services linked to the stored resources are ignored.

#### `POST /dsp/2025-1/catalog/request`
Request the meta information on the provider's root catalog, where a root catalog is one that is **not** contained in any other catalog. If a root catalog is found the response will be an [ACK - Catalog](https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/#ack-catalog).

> [!warning]
> This service assumes there to be a **single** root catalog in the app. If there is more than one root catalog, whichever is returned by the triplestore is used in the response. In that case the content of different responses may differ.

> [!warning]
> Filters are currently **not** support by this service. If an incoming request specifies a filter, the service will reply with a `400 Bad Request` response.

##### Response
- `200 OK` if a root catalog was found, the response body contains the meta information for the catalog
- `400 Bad Request` if an unsupported filter was provided in the request
- `500 Internal Server Error` if no root catalog could be found

#### `GET /dsp/2025-1/catalog/datasets/:id`
Request the meta information on a dataset identifier by the given id.

##### Response
- `200 OK` if a dataset with the provided id exists, the dataset meta information is contained in the response's body
- `400 Bad request` if no dataset with the requested id exists
