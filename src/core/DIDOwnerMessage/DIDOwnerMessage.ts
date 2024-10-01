import { Signer } from "../Signer";
import { PublicKey } from "@hashgraph/sdk";
import bs58 from "bs58";
import { Publisher } from "../Publisher";
import { DIDOwnerMessageLifeCycle } from "./DIDOwnerMessageLifeCycle";
import { DIDOwnerMessageHederaDefaultLifeCycle } from "./DIDOwnerMessageHederaDefaultLifeCycle";
import { DIDMessage } from "../DIDMessage";

// TODO: Add to payload?
const hederaNetwork = "testnet";

interface DIDOwnerMessageConstructor {
  controller: string;
  publicKey: PublicKey;
  timestamp?: Date;
  signature?: Uint8Array;
  topicId?: string;
}

export class DIDOwnerMessage extends DIDMessage {
  public readonly controller: string;
  public readonly publicKey: PublicKey;
  public readonly timestamp: Date;
  public signature?: Uint8Array;
  public topicId?: string;

  constructor(payload: DIDOwnerMessageConstructor) {
    super();
    this.controller = payload.controller;
    this.publicKey = payload.publicKey;
    this.timestamp = payload.timestamp || new Date();
    this.signature = payload.signature;
    this.topicId = payload.topicId;
  }

  public get operation(): "create" {
    return "create";
  }

  public get did(): string {
    // Probably not the best way to encode the public key and not working
    const publicKeyBase58 = bs58.encode(this.publicKey.toBytes());
    return `did:hedera:${hederaNetwork}:${publicKeyBase58}_${this.topicId}`;
  }

  protected get event(): string {
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

  protected get eventBytes(): Uint8Array {
    return new TextEncoder().encode(this.event);
  }

  protected get messagePayload(): string {
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

  public async execute(
    signer: Signer,
    publisher: Publisher,
    lifeCycle: DIDOwnerMessageLifeCycle = DIDOwnerMessageHederaDefaultLifeCycle
  ): Promise<void> {
    const { topicId } = await lifeCycle.preCreation({
      controller: this.controller,
      publicKey: this.publicKey,
      timestamp: this.timestamp.toISOString(),
      publisher,
      signer,
    });

    this.topicId = topicId;

    const preSigningResult = await lifeCycle.preSigning({
      event: this.event,
      eventBytes: this.eventBytes,
      controller: this.controller,
      publicKey: this.publicKey,
      topicId: this.topicId,
      timestamp: this.timestamp.toISOString(),
      publisher,
      signer,
    });

    if (preSigningResult?.signature) {
      this.setSignature(preSigningResult.signature);
    } else {
      const payloadSignature = await signer.sign(this.eventBytes);
      this.setSignature(payloadSignature);
    }

    if (!this.signature) {
      throw new Error("Signature is missing");
    }

    await lifeCycle.postSigning({
      signature: this.signature,
      controller: this.controller,
      publicKey: this.publicKey,
      topicId: this.topicId,
      timestamp: this.timestamp.toISOString(),
      message: this.messagePayload,
      publisher,
      signer,
    });

    await lifeCycle.postCreation({
      controller: this.controller,
      publicKey: this.publicKey,
      topicId: this.topicId,
      timestamp: this.timestamp.toISOString(),
      signature: this.signature,
      message: this.messagePayload,
      publisher,
      signer,
    });
  }

  public setSignature(signature: Uint8Array): void {
    // TODO Validate signature with the public key and event
    this.signature = signature;
  }

  toBytes(): string {
    const decoder = new TextDecoder("utf8");

    return Buffer.from(
      JSON.stringify({
        controller: this.controller,
        publicKey: this.publicKey.toStringRaw(),
        timestamp: this.timestamp.toISOString(),
        topicId: this.topicId,
        signature: this.signature ? btoa(decoder.decode(this.signature)) : "",
      })
    ).toString("base64");
  }

  static fromBytes(bytes: string): DIDOwnerMessage {
    const encoder = new TextEncoder();
    const data = JSON.parse(Buffer.from(bytes, "base64").toString("utf8"));

    return new DIDOwnerMessage({
      controller: data.controller,
      publicKey: PublicKey.fromString(data.publicKey),
      timestamp: new Date(data.timestamp),
      topicId: data.topicId,
      signature: data.signature
        ? encoder.encode(atob(data.signature))
        : undefined,
    });
  }
}
