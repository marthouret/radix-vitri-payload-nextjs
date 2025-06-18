'use client';
import dynamic from 'next/dynamic';
import type { VerrerieMapProps } from './VerrerieMap';

const VerrerieMap = dynamic<VerrerieMapProps>(
  () => import('./VerrerieMap').then(mod => mod.default),
  { ssr: false, loading: () => <div className="w-full h-full bg-blueGray-200 animate-pulse" /> }
);

export default VerrerieMap;