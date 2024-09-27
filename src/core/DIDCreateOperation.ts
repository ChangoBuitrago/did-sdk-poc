import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { DIDCreatePayload, LocalPublisher, LocalSigner } from '.';

class DIDCreateOperation {
  private signer: LocalSigner;
  private publisher: LocalPublisher;
  private payload: DIDCreatePayload;

  constructor({ signer, publisher, payload }: { signer: LocalSigner; publisher: LocalPublisher; payload: DIDCreatePayload }) {
    this.signer = signer;
    this.publisher = publisher;
    this.payload = payload;
  }

  async signPayload(): Promise<Uint8Array> {
    return this.signer.sign(this.payload.toBytes());
  }

  async prepareTransaction(signedPayload: Uint8Array): Promise<TopicMessageSubmitTransaction> {
    return new TopicMessageSubmitTransaction()
      .setMessage(signedPayload)
      .freezeWith(this.publisher.client);
  }

  async execute(): Promise<any> {
    const signedPayload = await this.signPayload();
    const transaction = await this.prepareTransaction(signedPayload);
    const response = await this.publisher.publish(transaction);

    return response.getReceipt(this.publisher.client);
  }
}

export { DIDCreateOperation };