import { LocalSigner } from "./LocalSigner";
import {
  Client,
  PublicKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
import bs58 from "bs58";
import { LocalPublisher } from "./LocalPublisher";

interface PreHookData {
  readonly controller: string;
  readonly publicKey: PublicKey;
  readonly publisher: LocalPublisher;
}

interface PreHookResponse {
  readonly topicId: string;
}

interface PostHookData {
  readonly controller: string;
  readonly publicKey: PublicKey;
  readonly topicId: string;
  readonly timestamp: Date;
  readonly signature: Uint8Array;
  readonly message: string;
  readonly publisher: LocalPublisher;
}

const preHook = async (data: PreHookData): Promise<PreHookResponse> => {
  const response = await data.publisher.publish(
    new TopicCreateTransaction()
      .setAdminKey(data.publicKey)
      .setSubmitKey(data.publicKey)
      .freezeWith(data.publisher.client)
  );

  const topicId = response.topicId?.toString();

  if (!topicId) {
    throw new Error("Failed to create a topic");
  }

  return {
    topicId: topicId,
  };
};

const postHook = async (data: PostHookData): Promise<void> => {
  await data.publisher.publish(
    new TopicMessageSubmitTransaction()
      .setTopicId(data.topicId)
      .setMessage(data.message)
      .freezeWith(data.publisher.client)
  );
};

// TODO: Add to payload?
const hederaNetwork = "testnet";

interface DIDOwnerMessageWithLifeCycleConstructor {
  controller: string;
  publicKey: PublicKey;
}

export class DIDOwnerMessageWithLifeCycle {
  public readonly controller: string;
  public readonly publicKey: PublicKey;
  public readonly timestamp = new Date();
  public signature?: Uint8Array;
  public topicId?: string;

  constructor(payload: DIDOwnerMessageWithLifeCycleConstructor) {
    this.controller = payload.controller;
    this.publicKey = payload.publicKey;
  }

  public get operation(): string {
    return "create";
  }

  public get did(): string {
    // Probably not the best way to encode the public key and not working
    const publicKeyBase58 = bs58.encode(this.publicKey.toBytes());
    return `did:hedera:${hederaNetwork}:${publicKeyBase58}_${this.topicId}`;
  }

  private get event(): string {
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

  private get eventBytes(): Uint8Array {
    return new TextEncoder().encode(this.event);
  }

  private get messagePayload(): string {
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
    signer: LocalSigner,
    publisher: LocalPublisher
  ): Promise<void> {
    const { topicId } = await preHook({
      controller: this.controller,
      publicKey: this.publicKey,
      publisher: publisher,
    });

    this.topicId = topicId;

    console.log("Topic ID:", this.topicId);

    const payloadSignature = await signer.sign(this.eventBytes);
    this.setSignature(payloadSignature);

    if (!this.signature) {
      throw new Error("Signature is missing");
    }

    await postHook({
      controller: this.controller,
      publicKey: this.publicKey,
      topicId: this.topicId,
      timestamp: this.timestamp,
      signature: this.signature,
      message: this.messagePayload,
      publisher: publisher,
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
