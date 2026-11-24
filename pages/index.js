import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace('/search'); }, [router]);
  return <div className="loading-screen">&#x25C6;</div>;
}
