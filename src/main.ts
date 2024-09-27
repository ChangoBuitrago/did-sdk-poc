import { Client } from '@hashgraph/sdk';
import { config as envConfig } from "dotenv"; 
import { DIDCreateOperation, DIDCreatePayload, LocalPublisher, LocalSigner } from './core'; 

async function main() {
  envConfig({ path: '.env.test' }); 

  // Retrieve account ID and private key  
  const accountId = process.env.OPERATOR_ID as string
  const privateKey = process.env.OPERATOR_PRIVATE_KEY as string

  // Initialize Hedera testnet client 
  const client = Client.forTestnet().setOperator(accountId, privateKey);

  // Replace this with the actual DID creation payload
  const didCreationPayload = '';

  // Create a DID create operation with the specified payload, signer, and publisher
  const didCreateOperation = new DIDCreateOperation({
    payload: new DIDCreatePayload(didCreationPayload),
    signer: new LocalSigner(privateKey),
    publisher: new LocalPublisher(client),
  });

  // Execute the transaction and log the receipt
  const receipt = await didCreateOperation.execute();
  console.log('Receipt:', receipt);
}

main();