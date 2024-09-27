class DIDCreatePayload {
  private _payload: string;

  constructor(payload: string) {
    this._payload = payload;
  }

  set payload(value: string) {
    this._payload = value;
  }

  get payload(): string {
    return this._payload;
  }

  toBytes(): Uint8Array {
    return new TextEncoder().encode(this._payload);
  }

  fromBytes(bytes: Uint8Array): DIDCreatePayload {
    const payloadString = new TextDecoder().decode(bytes);
    return new DIDCreatePayload(payloadString);
  }
}

export { DIDCreatePayload };