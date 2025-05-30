import { NextRequest, NextResponse } from 'next/server';

// In-memory store for demonstration (in production you'd use a database)
const metadataStore: Record<string, any> = {};

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Check if we already have this metadata stored
    if (metadataStore[id]) {
      return NextResponse.json(metadataStore[id]);
    }
    
    // If not, this is a new request - decode the ID
    const decodedJoke = decodeURIComponent(Buffer.from(id, 'base64').toString());
    
    // Get the host for creating absolute URLs
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    // Create image URL
    const imageUrl = `${baseUrl}/api/generateImage?joke=${encodeURIComponent(decodedJoke)}`;
    
    // Create coin metadata following EIP-7572 standard
    const metadata = {
      name: decodedJoke.split(' ').slice(0, 3).join(' ').substring(0, 30) || "Joke Coin",
      description: decodedJoke.substring(0, 500) || "A funny joke coin",
      symbol: decodedJoke.split(' ')
        .slice(0, 3)
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 5) || "JOKE",
      image: imageUrl
    };
    
    // Store for future requests
    metadataStore[id] = metadata;
    
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error generating metadata:', error);
    return NextResponse.json(
      { error: 'Failed to generate metadata' }, 
      { status: 500 }
    );
  }
} 