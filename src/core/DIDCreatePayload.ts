import { PublicKey } from "@hashgraph/sdk";

interface Payload {
  publicKey: PublicKey;
  topicId: string;
  controller: string;
}

class DIDCreatePayload {
  public readonly publicKey: PublicKey;
  public readonly topicId: string;
  public readonly controller: string;

  constructor(payload: Payload) {
    this.publicKey = payload.publicKey;
    this.topicId = payload.topicId;
    this.controller = payload.controller;
  }

  toBytes(): Uint8Array {
    const { buffer, byteOffset, byteLength } = Buffer.from(
      JSON.stringify(this)
    );

    return new Uint8Array(
      buffer,
      byteOffset,
      byteLength / Uint8Array.BYTES_PER_ELEMENT
    );
  }

  fromBytes(bytes: Uint8Array): DIDCreatePayload {
    const buffer = Buffer.from(bytes);
    const payload = JSON.parse(buffer.toString());
    return new DIDCreatePayload(payload as Payload);
  }
}

export { DIDCreatePayload };
