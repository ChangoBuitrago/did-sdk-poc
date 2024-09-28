import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { DIDCreatePayload, LocalPublisher, LocalSigner } from '.';

class DIDCreateOperation {
  private signer: LocalSigner;
  private publisher: LocalPublisher;
  private payload: DIDCreatePayload;
  private topicId: string;

  constructor({ signer, publisher, payload, topicId }: { signer: LocalSigner; publisher: LocalPublisher; payload: DIDCreatePayload; topicId: string }) {
    this.signer = signer;
    this.publisher = publisher;
    this.payload = payload;
    this.topicId = topicId;
  }

  private async signPayload(): Promise<Uint8Array> {
    return this.signer.sign(this.payload.toBytes());
  }

  private async prepareTransaction(signedPayload: Uint8Array): Promise<TopicMessageSubmitTransaction> {
    return new TopicMessageSubmitTransaction()
      .setTopicId(this.topicId)
      .setMessage(signedPayload)
      .freezeWith(this.publisher.client);
  }

  async execute(): Promise<any> {
    const signedPayload = await this.signPayload();
    const transaction = await this.prepareTransaction(signedPayload);
    return this.publisher.publish(transaction);
  }
}

export { DIDCreateOperation };