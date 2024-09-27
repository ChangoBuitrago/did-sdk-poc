import { PublicKey, TopicCreateTransaction } from '@hashgraph/sdk';
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

  async prepareTransaction(signedPayload: Uint8Array): Promise<TopicCreateTransaction> {
    const transaction = new TopicCreateTransaction()
      .setAdminKey(PublicKey.fromString(this.signer.publicKey))
      .setSubmitKey(PublicKey.fromString(this.signer.publicKey))
      .freezeWith(this.publisher.client);

    // Add the signed payload to the transaction (adjust as needed)
    // ..

    return transaction;
  }

  async execute(): Promise<any> {
    const signedPayload = await this.signPayload();
    const transaction = await this.prepareTransaction(signedPayload);
    return this.publisher.publish(transaction);
  }
}

export { DIDCreateOperation };