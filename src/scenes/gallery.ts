import { game } from '../core/game';
import type { Scene } from '../core/scene';
import { pixelText } from '../gfx/draw';
import '../gfx/world';
import { OBJECTS, TERRAIN } from '../world/registry';
import type { MapObject, TerrainId } from '../world/types';

/**
 * Art gallery (index.html#gallery): every registered terrain tile and object
 * kind laid out on a grid. Arrow keys / drag to scroll. #gallery?filter=b-
 * shows only kinds containing the filter text. ?night=1 previews lights.
 */
export class GalleryScene implements Scene {
  private camX = 0;
  private camY = 0;
  private filter: string;
  private night: boolean;
  private drag: { x: number; y: number; cx: number; cy: number } | null = null;
  constructor(params: URLSearchParams) {
    this.filter = params.get('filter') ?? '';
    this.night = params.get('night') === '1';
  }
  update(dt: number): void {
    const v = game.input.moveVector();
    this.camX += v.x * dt * 300;
    this.camY += v.y * dt * 300;
    const p = game.input.pointer;
    if (p.down) {
      if (!this.drag) this.drag = { x: p.x, y: p.y, cx: this.camX, cy: this.camY };
      this.camX = this.drag.cx - (p.x - this.drag.x);
      this.camY = this.drag.cy - (p.y - this.drag.y);
    } else this.drag = null;
  }
  render(ctx: CanvasRenderingContext2D): void {
    const { w, h } = game.screen;
    ctx.fillStyle = '#3a3048';
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(-Math.round(this.camX), -Math.round(this.camY));
    let x = 8;
    let y = 14;
    pixelText(ctx, 'TERRAIN', 8, 4, '#fff4dc');
    const ids = [...TERRAIN.keys()].filter((id) => id.includes(this.filter));
    for (const id of ids) {
      // 3x3 patch so edge blending shows.
      const def = TERRAIN.get(id as TerrainId)!;
      for (let ty = 0; ty < 3; ty++)
        for (let tx = 0; tx < 3; tx++) def.draw(ctx, x + tx * 16, y + ty * 16, tx + 7, ty + 3, (dx, dy) => (tx + dx < 0 || tx + dx > 2 || ty + dy < 0 || ty + dy > 2 ? 'grass' : (id as TerrainId)));
      pixelText(ctx, id, x, y + 50, '#fff4dc');
      x += 60;
      if (x > Math.max(w, 600) - 60) {
        x = 8;
        y += 64;
      }
    }
    y += 80;
    x = 8;
    pixelText(ctx, 'OBJECTS', 8, y - 10, '#fff4dc');
    let rowH = 0;
    const kinds = [...OBJECTS.keys()].filter((k) => k.includes(this.filter));
    const lights: { x: number; y: number; r: number; color: string }[] = [];
    for (const kind of kinds) {
      const k = OBJECTS.get(kind)!;
      // Measure by drawing into a scratch canvas would be costly; use generous cells.
      const big = kind.startsWith('b-') || ['ferris-wheel', 'watertower', 'radio-tower', 'ring', 'backyard-ring', 'airstream', 'fair-stage', 'tent', 'gazebo', 'mural', 'bear-pen', 'bleachers'].includes(kind);
      const cw = big ? 190 : 56;
      const ch = big ? 140 : 56;
      if (x + cw > Math.max(w, 900)) {
        x = 8;
        y += rowH + 16;
        rowH = 0;
      }
      ctx.fillStyle = '#7fae6a';
      ctx.fillRect(x, y, cw - 6, ch);
      const o: MapObject = { id: kind, kind, x: x + (cw - 6) / 2, y: y + ch - 6, props: { w: 3, h: 2, variant: 0, text: 'SIGN', raccoon: true, state: 'overgrown', color: 'red' } };
      k.draw(ctx, o, game.t);
      if (k.lights) lights.push(...k.lights(o));
      pixelText(ctx, kind, x, y + ch + 2, '#fff4dc');
      x += cw;
      rowH = Math.max(rowH, ch);
    }
    if (this.night) {
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#1a1838';
      ctx.fillRect(0, 0, 4000, 4000);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'lighter';
      for (const l of lights) {
        const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
        g.addColorStop(0, l.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  }
}
