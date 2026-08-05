import { redirect } from 'next/navigation'

/**
 * Root route — redirect to /search.
 * city_id must be provided by the consumer (white-label embed or direct navigation).
 */
export default function HomePage() {
  redirect('/acton-ma/search')
}
