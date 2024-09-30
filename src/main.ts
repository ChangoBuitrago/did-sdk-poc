import { Client, PrivateKey } from "@hashgraph/sdk";
import { config as envConfig } from "dotenv";
import {
  DIDCreateOperation,
  DIDCreatePayload,
  LocalPublisher,
  LocalSigner,
} from "./core";

async function main() {
  envConfig({ path: ".env.test" });

  // Retrieve account ID and private key
  const accountId = process.env.OPERATOR_ID as string;
  const privateKey = process.env.OPERATOR_PRIVATE_KEY as string;

  // Initialize Hedera testnet client
  const client = Client.forTestnet().setOperator(accountId, privateKey);

  // Replace this with the actual DID creation payload
  const didCreationPayload = {
    publicKey: PrivateKey.fromStringDer(privateKey).publicKey,
    topicId: "0.0.4928231",
    controller:
      "did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790",
  };

  // Create a DID create operation with the specified topicId, payload, signer, and publisher
  const didCreateOperation = new DIDCreateOperation({
    payload: new DIDCreatePayload(didCreationPayload),
    signer: new LocalSigner(privateKey),
    publisher: new LocalPublisher(client),
  });

  try {
    // Execute the transaction and log the status
    const { status } = await didCreateOperation.execute();
    console.log('Status:', status);
  } finally {
    // Ensure the client is closed to prevent hanging
    await client.close(); 
  }
}

main();
