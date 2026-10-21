/** Integration contract; not connected to a paid or free sports service.
 * adapter.fetchConfirmed(eventIds): Promise<Array<{
 *   eventId:string, revision:string, state:'final'|'cancelled'|'postponed',
 *   homeScore?:number, awayScore?:number, source:string, confirmedAt:number
 * }>>
 * apply(result) must validate event identity, persist source/revision,
 * and update the event + its tickets atomically. Repeating revisions must be safe.
 */
export class DemoOnlyProvider {
  async fetchConfirmed(){throw new Error('SPORTS_PROVIDER_NOT_CONFIGURED')}
}
export async function syncConfirmed(adapter,eventIds,apply,{attempts=3,wait=ms=>new Promise(r=>setTimeout(r,ms))}={}){
  if(adapter instanceof DemoOnlyProvider)return {enabled:false,applied:0};
  let error;for(let attempt=0;attempt<attempts;attempt++){
    try{const results=await adapter.fetchConfirmed(eventIds);let applied=0;
      for(const r of results){if(!r.eventId||!r.revision||!r.source||!Number.isFinite(r.confirmedAt))throw new Error('Incomplete provider result');await apply(r);applied++}
      return {enabled:true,applied};
    }catch(e){error=e;if(attempt+1<attempts)await wait(1000*2**attempt)}
  }throw error;
}
