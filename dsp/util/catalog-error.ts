import { DSP_CONTEXT, STATUS_CODE } from "../../config";

export class CatalogError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public reason?: string[],
  ) {
    super(message);

    if (!this.status) {
      this.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
    }

    this.code = code;
    this.reason = reason || [message];
  }

  public toJson() {
    const json = {
      "@context": [DSP_CONTEXT],
      "@type": "CatalogError",
    };

    if (this.code && this.code.length > 0) {
      json["code"] = this.code;
    }

    if (this.reason && this.reason.length > 0) {
      json["reason"] = this.reason;
    }

    return json;
  }
}
