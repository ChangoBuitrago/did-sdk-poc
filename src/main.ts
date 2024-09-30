import { Client, PrivateKey } from "@hashgraph/sdk";
import { config as envConfig } from "dotenv";
import {
  DIDCreateOperation,
  DIDCreatePayload,
  LocalPublisher,
  LocalSigner,
} from "./core";
import { DIDOwnerMessage } from "./core/DIDOwnerMessage";
import { DIDOwnerMessageWithLifeCycle } from "./core/DIDOwnerMessage-lifecycle";

async function main() {
  envConfig({ path: ".env.test" });

  // Retrieve account ID and private key
  const accountId = process.env.OPERATOR_ID as string;
  const privateKey = process.env.OPERATOR_PRIVATE_KEY as string;

  // Initialize Hedera testnet client
  const client = Client.forTestnet().setOperator(accountId, privateKey);

  const signer = new LocalSigner(privateKey);
  const publisher = new LocalPublisher(client);

  // Create a DID create operation with the specified topicId, payload, signer, and publisher
  const didOwnerMessage = new DIDOwnerMessageWithLifeCycle({
    publicKey: PrivateKey.fromStringDer(privateKey).publicKey,
    controller:
      "did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790",
  });

  await didOwnerMessage.execute(signer, publisher);

  client.close();
}

main();
