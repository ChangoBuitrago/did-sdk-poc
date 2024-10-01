import { PublicKey } from "@hashgraph/sdk";
import { DIDMessageLifeCycle } from "../DIDMessage/DIDMessageLifeCycle";
import { Publisher } from "../Publisher";
import { Signer } from "../Signer";

interface DIDOwnerMessageBaseData {
  readonly publisher: Publisher;
  readonly signer: Signer;
}

export interface DIDOwnerMessagePreCreationData
  extends DIDOwnerMessageBaseData {
  controller: string;
  publicKey: PublicKey;
  timestamp: string;
}
export interface DIDOwnerMessagePreCreationResult {
  topicId: string;
}

export interface DIDOwnerMessagePreSigningData extends DIDOwnerMessageBaseData {
  event: string;
  eventBytes: Uint8Array;
  controller: string;
  publicKey: PublicKey;
  topicId: string;
  timestamp: string;
}
export type DIDOwnerMessagePreSigningResult = {
  signature: Uint8Array;
} | void;

export interface DIDOwnerMessagePostSigningData
  extends DIDOwnerMessageBaseData {
  signature: Uint8Array;
  controller: string;
  publicKey: PublicKey;
  topicId: string;
  timestamp: string;
  message: string;
}
export type DIDOwnerMessagePostSigningResult = void;

export interface DIDOwnerMessagePostCreationData
  extends DIDOwnerMessageBaseData {
  controller: string;
  publicKey: PublicKey;
  topicId: string;
  timestamp: string;
  signature: Uint8Array;
  message: string;
}
export type DIDOwnerMessagePostCreationResult = void;

export type DIDOwnerMessageLifeCycle = DIDMessageLifeCycle<
  DIDOwnerMessagePreCreationData,
  DIDOwnerMessagePreCreationResult,
  DIDOwnerMessagePreSigningData,
  DIDOwnerMessagePreSigningResult,
  DIDOwnerMessagePostSigningData,
  DIDOwnerMessagePostSigningResult,
  DIDOwnerMessagePostCreationData,
  DIDOwnerMessagePostCreationResult
>;
