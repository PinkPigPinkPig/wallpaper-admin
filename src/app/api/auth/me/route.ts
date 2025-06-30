import { cookies } from 'next/headers';

export async function GET() {
  const user = (await cookies()).get('user')?.value;

  return new Response(JSON.stringify(user), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
