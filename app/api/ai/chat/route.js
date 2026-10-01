import { POST as chatHandler } from '@/app/api/chat/route';

export const runtime = 'nodejs';

export async function POST(request) {
  return chatHandler(request);
}
