import Link from 'next/link';
export default function NotFound(){return <main id="hovedinnhold" className="not-found"><p className="eyebrow" style={{justifyContent:'center'}}>404 · DENNE SIDEN FINNES IKKE</p><h1>Men middag<br/>kan vi finne.</h1><p>Gå til forsiden og få tre forslag med én gang.</p><Link href="/" className="button button-primary">Til middagstipsene</Link></main>}
