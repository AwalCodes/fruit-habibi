import { NextRequest, NextResponse } from 'next/server';
import { EscrowService } from '@/lib/escrow';
import { verifyCronSecret } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job request with secret
    if (!verifyCronSecret(request)) {
      console.error('Unauthorized cron request attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting auto-release escrow process...');
    
    // Process expired escrow funds
    await EscrowService.autoReleaseExpiredFunds();
    
    console.log('Auto-release escrow process completed');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Auto-release escrow process completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Auto-release escrow error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET endpoint explicitly blocked for security
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Method Not Allowed',
      message: 'GET requests are not allowed. Use POST with CRON_SECRET in Authorization header.',
      allowedMethod: 'POST'
    },
    { status: 405 }
  );
}

