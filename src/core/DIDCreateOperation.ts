import { PublicKey, TopicCreateTransaction } from '@hashgraph/sdk';
import { DIDCreatePayload, LocalPublisher, LocalSigner } from '.';

class DIDCreateOperation {
  private signer: LocalSigner;
  private publisher: LocalPublisher;
  private payload: DIDCreatePayload;
  private transaction: TopicCreateTransaction;

  constructor({ signer, publisher, payload }: { signer: LocalSigner; publisher: LocalPublisher; payload: DIDCreatePayload }) {
    this.signer = signer;
    this.publisher = publisher;
    this.payload = payload;
    this.transaction = new TopicCreateTransaction();
  }

  async prepareTransaction(): Promise<void> {
    // Sign the payload before setting it in the transaction
    const payloadBytes = new TextEncoder().encode(JSON.stringify(this.payload));
    
    const signedPayload = await this.signer.sign(payloadBytes);
    console.log(signedPayload)
    
    // Set transaction properties and add the signed payload
    this.transaction
      .setAdminKey(PublicKey.fromString(this.signer.publicKey))
      .setSubmitKey(PublicKey.fromString(this.signer.publicKey))
      // .freezeWith(this.publisher.client)
  }

  async execute(): Promise<any> {
    await this.prepareTransaction(); // Ensure transaction is prepared before executing
    return this.publisher.publish(this.transaction);
  }
}

export { DIDCreateOperation };
