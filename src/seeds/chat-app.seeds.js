import { faker } from "@faker-js/faker";
import { User } from "../models/apps/auth/user.models.js";
import { Chat } from "../models/apps/chat-app/chat.models.js";
import { ChatMessage } from "../models/apps/chat-app/message.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getRandomNumber } from "../utils/helpers.js";
import {
  GROUP_CHATS_COUNT,
  GROUP_CHAT_MAX_PARTICIPANTS_COUNT,
  ONE_ON_ONE_CHATS_COUNT,
} from "./_constants.js";

const seedOneOnOneChats = async () => {
  const users = await User.find();
  const chatsArray = new Array(ONE_ON_ONE_CHATS_COUNT)
    /**The fill() method is a built-in method in JavaScript that is used to fill an array with a specified value. */
    .fill("_")
    /**Using async (_) => { ... } is a valid way to indicate an asynchronous function that can accept a parameter,
     * but the parameter isn't used inside the function. This is often done for clarity and documentation to signify the function's asynchronous nature. */
    .map(async (_) => {
      let index1 = getRandomNumber(users.length);
      let index2 = getRandomNumber(users.length);
      if (index1 === index2) {
        // This shows that both participant indexes are the same
        index2 <= 0 ? index2++ : index2--; // avoid same participants
      }
      const participants = [
        users[index1]._id.toString(),
        users[index2]._id.toString(),
      ];
      await Chat.findOneAndUpdate(
        {
          $and: [
            {
              participants: {
                $elemMatch: { $eq: participants[0] },
              },
            },
            {
              participants: {
                $elemMatch: { $eq: participants[1] },
              },
            },
          ],
        },
        {
          $set: {
            name: "One on one chat",
            isGroupChat: false,
            participants,
            admin: participants[getRandomNumber(participants.length)],
          },
        },
        { upsert: true } // We don't want duplicate entries of the chat. So if found then update else insert
      );
    });
  await Promise.all([...chatsArray]);
  /**
   * promises in the chatsArray array to resolve before continuing with the execution of the code.
   1. The Promise.all() method takes an array of promises and returns a new promise that resolves when all the promises in the array have resolved.
   2. The spread operator ... is used to spread the elements of the chatsArray array into a new array. This is done to ensure that the Promise.all() method receives an array of promises as its argument.
   3. The await keyword is used to wait for the promise returned by the Promise.all() method to resolve. This means that the code execution will pause at this line until all the promises in the chatsArray array have resolved.
   */
};

const seedGroupChats = async () => {
  const users = await User.find();

  const groupChatsArray = new Array(GROUP_CHATS_COUNT).fill("_").map((_) => {
    let participants = [];
    const participantsCount = getRandomNumber(
      GROUP_CHAT_MAX_PARTICIPANTS_COUNT
    );

    /** 
     * priority resolution of the below code
     * 1. first check if participantsCount < 3
     * 2. if true then return 3 else return participantsCount
     * ( participantsCount < 3 ) ? 3 : participantsCount
     */
    new Array(participantsCount < 3 ? 3 : participantsCount)
      .fill("_")
      .forEach((_) =>
        participants.push(users[getRandomNumber(users.length)]._id.toString())
      );

    participants = [...new Set(participants)];

    return {
      name: faker.vehicle.vehicle() + faker.company.buzzNoun(),
      isGroupChat: true,
      participants,
      admin: participants[getRandomNumber(participants.length)],
    };
  });
  await Chat.insertMany(groupChatsArray);
};

const seedChatApp = asyncHandler(async (req, res) => {
  await Chat.deleteMany({});
  await ChatMessage.deleteMany({});
  await seedOneOnOneChats();
  await seedGroupChats();

  return res
    .status(201)
    .json(
      new ApiResponse(201, {}, "Database populated for chat app successfully")
    );
});

export { seedChatApp };
