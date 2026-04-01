const { GoogleGenAI } = require("@google/genai");
const {
  Client,
  GatewayIntentBits,
  Attachment,
  AttachmentBuilder,
} = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

async function generateImage(prompt) {
  //free api is not allowing to generate image, so I am using text generation api to generate image and then converting it to buffer and sending it as attachment
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      return buffer;
    }
  }
}

async function reply(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "answer should have only 5 lines at max",
    },
  });
  return response;
}

client.once("ready", () => {
  console.log("Bot is online!");
});

client.on("messageCreate", async (message) => {
  if (message.member.user.bot) return;

  const prompt = message.content;
  if (!prompt) return;

  try {
    const response = await reply(prompt);
    await message.reply(response.text);
  } catch (error) {
    console.error("Error:", error);
    message.reply("Sorry, I couldn't generate a response.");
  }

  console.log(`Received message: ${message}`);

  // attachments.forEach((Attachment) => {
  //   console.log(Attachment.url);
  // });
});

client.login(process.env.DISCORD_BOT_TOKEN);
