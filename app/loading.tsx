import { Skeleton } from '@/components/ui/skeleton';
export default function Loading(){return <main id="hovedinnhold" className="content-page" aria-busy="true"><p role="status">Henter middagen …</p><div className="loading-demo"><Skeleton/><Skeleton/><Skeleton/></div></main>}
