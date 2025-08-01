import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')
  let realIP = forwarded ? forwarded.split(',')[0] : 'unknown'

  // Strip IPv6 prefix if present (::ffff:)
  if (realIP.startsWith('::ffff:')) {
    realIP = realIP.substring(7)
  }

  const allowedIP = process.env.MY_IP_ADDRESS

  return NextResponse.json({
    yourIP: realIP,
    allowedIP: allowedIP,
    isAllowed: realIP === allowedIP,
    headers: {
      'x-forwarded-for': request.headers.get('x-forwarded-for'),
      'x-real-ip': request.headers.get('x-real-ip'),
      'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
    }
  })
}