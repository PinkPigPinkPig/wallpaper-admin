export async function GET() {
  // For GET requests, we'll return a message indicating this endpoint expects POST with user data
  return Response.json({ 
    message: 'This endpoint expects a POST request with user data in the body' 
  }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user } = body;

    if (!user) {
      return Response.json({ error: 'No user data provided' }, { status: 400 });
    }

    return Response.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return Response.json({ error: 'Failed to get user data' }, { status: 500 });
  }
}
