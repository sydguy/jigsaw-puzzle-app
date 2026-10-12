import type { Definition, Edges } from "./engine";
/** v10's complementary bezier profile, generated once per exact cut definition. */
function outline(ctx: CanvasRenderingContext2D, cell: number, pad: number, edges: Edges) {
  const corners = [[pad, pad], [pad + cell, pad], [pad + cell, pad + cell], [pad, pad + cell]];
  const normals = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  ctx.beginPath(); ctx.moveTo(pad, pad);
  for (let i = 0; i < 4; i++) {
    const [sx, sy] = corners[i]!, [ex, ey] = corners[(i + 1) % 4]!, [nx, ny] = normals[i]!;
    const point = (a: number, h: number): [number, number] => [sx! + (ex! - sx!) * a + nx! * h, sy! + (ey! - sy!) * a + ny! * h];
    if (!edges[i]) { ctx.lineTo(ex!, ey!); continue; }
    const tab = edges[i]! * cell * .2;
    ctx.lineTo(...point(.4, 0)); ctx.bezierCurveTo(...point(.5, 0), ...point(.32, tab), ...point(.5, tab));
    ctx.bezierCurveTo(...point(.68, tab), ...point(.5, 0), ...point(.6, 0)); ctx.lineTo(ex!, ey!);
  }
  ctx.closePath();
}
export async function sprites(uri: string, d: Definition): Promise<HTMLCanvasElement[]> {
  const image = new Image(); await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Could not load the saved puzzle picture.")); image.src = uri; });
  const cell = 1024 / d.side, pad = cell * .25;
  return d.edges.map((edges, id) => {
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = Math.ceil(cell + pad * 2);
    const ctx = canvas.getContext("2d")!; outline(ctx, cell, pad, edges);
    ctx.save(); ctx.clip(); ctx.drawImage(image, pad - (id % d.side) * cell, pad - Math.floor(id / d.side) * cell, 1024, 1024); ctx.restore();
    ctx.strokeStyle = "#17124f88"; ctx.lineWidth = .7; ctx.stroke();
    return canvas;
  });
}
