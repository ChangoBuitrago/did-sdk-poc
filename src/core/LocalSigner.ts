import { PrivateKey } from "@hashgraph/sdk";

class LocalSigner {
  private _privateKey: PrivateKey;

  constructor(privateKeyDer: string) {
    this._privateKey = PrivateKey.fromStringDer(privateKeyDer);
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    return await this._privateKey.sign(message);
  }

  get publicKey(): string {
    return this._privateKey.publicKey.toStringDer();
  }
}

export { LocalSigner };
