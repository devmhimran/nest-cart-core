import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AiService } from './ai/ai.service';
import { MessageRole } from './constants/enums';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const aiService = app.get(AiService);

  const testMessage =
    process.argv[2] || 'Please provide all the categories data';
  console.log(`Sending message to AI: "${testMessage}"`);

  const history = [
    {
      role: MessageRole.USER,
      content: testMessage,
    },
  ];

  try {
    const response = await aiService.generateResponse(history);
    console.log('\n--- AI RESPONSE ---');
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('Error executing AI response:', error);
  } finally {
    await app.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
