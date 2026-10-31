// Byte-bounded streaming reader. Oversized lines are discarded without buffering
// their remainder; a bad record does not prevent later records being considered.
export async function* readJsonLines(stream,maxBytes=65536){
  let parts=[],size=0,over=false,line=0;
  function result(){
    line++;
    if(over) return {line,error:'RECORD_TOO_LARGE'};
    const text=Buffer.concat(parts,size).toString('utf8').trim();
    if(!text) return {line,empty:true};
    try{return {line,value:JSON.parse(text)};}catch{return {line,error:'INVALID_JSON'};}
  }
  for await(const chunk of stream){
    const bytes=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);
    let start=0;
    while(start<bytes.length){
      const end=bytes.indexOf(10,start),stop=end<0?bytes.length:end;
      const part=bytes.subarray(start,stop);
      if(!over){size+=part.length;if(size>maxBytes){over=true;parts=[];}else parts.push(Buffer.from(part));}
      if(end<0) break;
      yield result();parts=[];size=0;over=false;start=end+1;
    }
  }
  if(size||over) yield result();
}
