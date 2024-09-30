import bs58 from "bs58";
import {
  TopicMessageSubmitTransaction,
  TransactionReceipt,
} from "@hashgraph/sdk";
import { DIDCreatePayload, LocalPublisher, LocalSigner } from ".";
import { DIDOwnerMessage } from "./DIDOwnerMessage";

interface DIDCreateOperationConstructor {
  signer: LocalSigner;
  publisher: LocalPublisher;
  payload: DIDCreatePayload;
}

// TODO: Add to payload?
const hederaNetwork = "testnet";

class DIDCreateOperation {
  private readonly signer: LocalSigner;
  private readonly publisher: LocalPublisher;
  private readonly payload: DIDCreatePayload;
  private readonly message: DIDOwnerMessage;

  constructor({ signer, publisher, payload }: DIDCreateOperationConstructor) {
    this.signer = signer;
    this.publisher = publisher;
    this.payload = payload;

    this.message = new DIDOwnerMessage(
      this.did,
      this.payload.controller,
      this.payload.publicKey,
      this.payload.topicId
    );
  }

  private get did(): string {
    // Probably not the best way to encode the public key and not working
    const publicKeyBase58 = bs58.encode(this.payload.publicKey.toBytes());
    return `did:hedera:${hederaNetwork}:${publicKeyBase58}_${this.payload.topicId}`;
  }

  private async signEvent(): Promise<Uint8Array> {
    const payloadSignature = await this.signer.sign(this.message.eventBytes);
    this.message.setSignature(payloadSignature);
    return payloadSignature;
  }

  private async prepareTransaction(): Promise<TopicMessageSubmitTransaction> {
    return new TopicMessageSubmitTransaction()
      .setTopicId(this.payload.topicId)
      .setMessage(this.message.messagePayload)
      .freezeWith(this.publisher.client);
  }

  async execute(): Promise<TransactionReceipt> {
    await this.signEvent();
    const transaction = await this.prepareTransaction();
    return this.publisher.publish(transaction);
  }
}

export { DIDCreateOperation };
