import { Signer } from "../Signer";
import { Publisher } from "../Publisher";
import { DIDMessageLifeCycle } from "./DIDMessageLifeCycle";

export abstract class DIDMessage {
  /**
   * The operation that the DID message is performing.
   */
  abstract get operation(): "create" | "update" | "revoke";

  /**
   * The DID that the message is associated with.
   */
  abstract get did(): string;

  /**
   * The event that the DID message is associated with. e.g. DIDOwner, DIDDocument, etc.
   * This is a base64 encoded JSON string that represents the event.
   */
  protected abstract get event(): string;

  /**
   * The event bytes that the DID message is associated with. Represents the event in bytes that can be signed.
   */
  protected abstract get eventBytes(): Uint8Array;

  /**
   * The message payload that is ready to be committed to the ledger. This is a base64 encoded JSON string.
   */
  protected abstract get messagePayload(): string;

  /**
   * Executes the DID message processing.
   */
  abstract execute(
    signer: Signer,
    publisher: Publisher,
    lifeCycle: DIDMessageLifeCycle
  ): Promise<void> | void;

  /**
   * Sets the signature of the DID event.
   */
  abstract setSignature(signature: Uint8Array): void;

  /**
   * Method to convert the DID message to bytes for a serialized representation. A base64 encoded string is returned.
   */
  abstract toBytes(): string;
}
