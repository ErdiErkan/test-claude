import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`

    // Return health status
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          application: 'running',
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'disconnected',
          application: 'running',
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}
