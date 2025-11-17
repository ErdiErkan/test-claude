// Search API Endpoint
// Path: src/app/api/search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { searchCelebrities, autocomplete } from '@/lib/services/search.service';
import { logSearch } from '@/lib/services/analytics.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q') || '';
    const autocompleteMode = searchParams.get('autocomplete') === 'true';
    const country = searchParams.get('country') || undefined;
    const profession = searchParams.get('profession') || undefined;
    const tags = searchParams.get('tags')?.split(',') || undefined;
    const sort = (searchParams.get('sort') as 'relevance' | 'popularity' | 'name') || 'relevance';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Autocomplete mode (fast, limited results)
    if (autocompleteMode) {
      const results = await autocomplete(query, 8);

      return NextResponse.json({
        results,
        total: results.length,
        query,
      });
    }

    // Full search
    const searchResults = await searchCelebrities({
      query,
      filters: {
        country,
        profession,
        tags,
      },
      sort,
      limit,
      offset,
    });

    // Log search (async, non-blocking)
    const userAgent = request.headers.get('user-agent') || undefined;
    const userIp = request.headers.get('x-forwarded-for')?.split(',')[0] || undefined;

    logSearch({
      query,
      resultsCount: searchResults.total,
      userIp,
      userAgent,
    }).catch(console.error);

    return NextResponse.json(
      {
        results: searchResults.results,
        total: searchResults.total,
        query: searchResults.query,
        processingTime: searchResults.processingTime,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < searchResults.total,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint for logging search clicks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, celebrityId, position } = body;

    if (!query || !celebrityId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent') || undefined;
    const userIp = request.headers.get('x-forwarded-for')?.split(',')[0] || undefined;

    await logSearch({
      query,
      resultsCount: 1,
      matchedCelebrityId: celebrityId,
      clickedPosition: position,
      userIp,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Search click logging error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
