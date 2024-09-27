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
}

export { DIDCreatePayload };