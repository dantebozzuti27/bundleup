import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { projectQuery } = await request.json();

    if (!projectQuery) {
      return NextResponse.json(
        { error: 'Project query is required' },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a helpful DIY shopping assistant. A user wants to build/create: "${projectQuery}"

Generate a comprehensive checklist of items they will need. Return ONLY a JSON array of objects with this structure:
[
  {
    "name": "item name",
    "category": "category",
    "priority": "essential" or "optional",
    "quantity": "estimated quantity",
    "notes": "brief helpful note"
  }
]

Focus on:
- Physical materials and tools needed
- Be specific but not overwhelming (5-12 items typically)
- Include both obvious and often-forgotten items
- Prioritize essential items first

Example for "backyard bar":
[
  {"name": "Outdoor bar counter or cabinet", "category": "furniture", "priority": "essential", "quantity": "1", "notes": "Weather-resistant material recommended"},
  {"name": "Bar stools", "category": "furniture", "priority": "essential", "quantity": "4-6", "notes": "Choose height based on bar counter"},
  {"name": "Mini fridge", "category": "appliances", "priority": "essential", "quantity": "1", "notes": "Look for outdoor-rated models"},
  {"name": "Bottle opener", "category": "accessories", "priority": "essential", "quantity": "1", "notes": "Wall-mounted or portable"},
  {"name": "String lights or LED strips", "category": "lighting", "priority": "optional", "quantity": "1 set", "notes": "Adds ambiance"},
  {"name": "Bar shelving", "category": "storage", "priority": "optional", "quantity": "2-3", "notes": "For glassware and bottles"}
]

Return ONLY the JSON array, no other text.`,
        },
      ],
    });

    const responseText = message.content[0].text;
    
    // Parse the JSON from Claude's response
    let checklist;
    try {
      checklist = JSON.parse(responseText);
    } catch (parseError) {
      // If Claude returns markdown code blocks, strip them
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        checklist = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse checklist from AI response');
      }
    }

    return NextResponse.json({
      success: true,
      checklist,
      projectQuery,
    });

  } catch (error) {
    console.error('AI Checklist Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate checklist', details: error.message },
      { status: 500 }
    );
  }
}
