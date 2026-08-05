import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AiService } from './ai/ai.service';
import { MessageRole } from './constants/enums';
import { PrismaService } from './prisma/prisma.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const aiService = app.get(AiService);
  const prisma = app.get(PrismaService);

  console.log('--- DATABASE CHECK ---');
  const [categories, promoCodes] = await Promise.all([
    prisma.category.findMany({ select: { id: true, name: true, slug: true } }),
    prisma.promoCode.findMany({ select: { id: true, code: true, amount: true } }),
  ]);
  console.log('Categories in DB:', categories);
  console.log('Promo Codes in DB:', promoCodes);
  console.log('----------------------\n');

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
