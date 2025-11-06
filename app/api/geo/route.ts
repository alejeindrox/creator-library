import { geolocation } from '@vercel/functions';

export const runtime = 'edge';

export async function GET(req: Request) {
  console.log('Geolocation API called');
  console.log(geolocation(req));

  const { country, city, region } = geolocation(req);

  return new Response(
    JSON.stringify({
      country: country || 'Unknown',
      city: city || 'Unknown',
      region: region || 'Unknown',
    }),
    {
      headers: {
        'content-type': 'application/json; charset=utf-8',
      },
    },
  );
}
