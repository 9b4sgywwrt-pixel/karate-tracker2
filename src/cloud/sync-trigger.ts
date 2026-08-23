const listeners=new Set<()=>void>();
export function notifyLocalChange(){for(const listener of listeners)listener();}
export function subscribeToLocalChanges(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
