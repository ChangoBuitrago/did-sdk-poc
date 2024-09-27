import { Client } from '@hashgraph/sdk';
import { config as envConfig } from "dotenv"; 
import { DIDCreateOperation, DIDCreatePayload, LocalPublisher, LocalSigner } from './core'; 

async function main() {
  envConfig({ path: '.env.test' }); 

  const client = Client.forTestnet();

  // Set the operator ID and private key for the client
  const operatorId = process.env.OPERATOR_ID as string
  const operatorPrivateKey = process.env.OPERATOR_PRIVATE_KEY as string
  client.setOperator(operatorId, operatorPrivateKey);

  // Replace this with the actual DID creation data
  const didCreationData = '';

  // Create a DID create operation with the specified data, signer, and publisher
  const didCreateOperation = new DIDCreateOperation({
    payload: new DIDCreatePayload(didCreationData),
    signer: new LocalSigner(operatorPrivateKey),
    publisher: new LocalPublisher(client),
  });

  // Execute the transaction and log the receipt
  const receipt = await didCreateOperation.execute();
  console.log('Receipt:', receipt);
}

main();