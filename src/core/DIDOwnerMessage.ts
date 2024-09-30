import { LocalSigner } from "./LocalSigner";
import { PublicKey } from "@hashgraph/sdk";

export class DIDOwnerMessage {
  constructor(
    public readonly id: string,
    public readonly controller: string,
    public readonly publicKey: PublicKey,
    public readonly topicId: string,
    public readonly timestamp = new Date(),
    public signature?: Uint8Array
  ) {}

  public get operation(): string {
    return "create";
  }

  public get did(): string {
    return this.id;
  }

  public get event(): string {
    return JSON.stringify({
      DIDOwner: {
        id: `${this.did}#did-root-key`,
        type: "Ed25519VerificationKey2020",
        controller: this.controller,
        // TODO: change to publicKeyMultibase
        publicKeyMultibase: this.publicKey.toStringDer(),
      },
    });
  }

  public get eventBytes(): Uint8Array {
    return new TextEncoder().encode(this.event);
  }

  public get messagePayload(): string {
    if (!this.signature) {
      throw new Error("Signature is missing");
    }

    return JSON.stringify({
      message: {
        timestamp: this.timestamp.toISOString(),
        operation: this.operation,
        did: this.did,
        event: Buffer.from(this.event).toString("base64"),
      },
      signature: Buffer.from(this.signature).toString("base64"),
    });
  }

  // Option #1: Set given signature with validation
  public setSignature(signature: Uint8Array): void {
    // TODO Validate signature with the public key and event
    this.signature = signature;
  }

  // Option #2: Sign the message with the given signer and validate the signature
  public async signWith(signer: LocalSigner) {
    // TODO: Validate signature with the public key and event
    this.signature = await signer.sign(Buffer.from(this.messagePayload));
  }
}
