import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
import { DIDOwnerMessageLifeCycle } from "./DIDOwnerMessageLifeCycle";

const clearData = (data: any) => {
  return JSON.stringify({
    ...data,
    signer: undefined,
    publisher: undefined,
    publicKey: data.publicKey.toStringDer(),
    eventBytes: data.eventBytes ? "<bytes>" : undefined,
    signature: data.signature ? "<bytes>" : undefined,
  });
};

export const DIDOwnerMessageHederaDefaultLifeCycle: DIDOwnerMessageLifeCycle = {
  preCreation: async (data) => {
    console.log(`[DIDOwnerMessage] Pre creation data: ${clearData(data)}`);

    const response = await data.publisher.publish(
      new TopicCreateTransaction()
        .setAdminKey(data.publicKey)
        .setSubmitKey(data.publicKey)
        .freezeWith(data.publisher.client)
    );

    const topicId = response.topicId?.toString();

    if (!topicId) {
      throw new Error("Failed to create a topic");
    }

    return {
      topicId: topicId,
    };
  },
  preSigning: async (data) => {
    console.log(`[DIDOwnerMessage] Pre signing data: ${clearData(data)}`);
  },
  postSigning: async (data) => {
    console.log(`[DIDOwnerMessage] Post signing data: ${clearData(data)}`);
  },
  postCreation: async (data) => {
    console.log(`[DIDOwnerMessage] Post creation data: ${clearData(data)}`);

    await data.publisher.publish(
      new TopicMessageSubmitTransaction()
        .setTopicId(data.topicId)
        .setMessage(data.message)
        .freezeWith(data.publisher.client)
    );
  },
};
