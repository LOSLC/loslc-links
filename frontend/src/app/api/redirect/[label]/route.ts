import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ label: string }> }
) {
  try {
    const { label } = await params;
    
    // Get the link by label
    const link = await apiClient.getLinkByLabel(label);
    
    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    // Redirect to the actual URL
    return NextResponse.redirect(link.url, 302);
  } catch (error) {
    console.error('Error redirecting:', error);
    return NextResponse.json(
      { error: 'Link not found' },
      { status: 404 }
    );
  }
}
