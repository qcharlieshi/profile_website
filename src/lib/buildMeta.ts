export interface BuildMeta {
  date: string;
  hash: string;
  coords: string;
}

export function getBuildMeta(): BuildMeta {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return {
    date: `${yy}.${mm}.${dd}`,
    hash: `0x${Date.now().toString(16).slice(-4).toUpperCase()}`,
    coords: 'N 42°39′ W 71°08′',
  };
}
