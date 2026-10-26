import type {Pose} from '@/content/poses';
import {CAMERA_HEIGHT_LABEL} from '@/content/poses';
import {cameraY, personShapes} from '@/lib/figure';

// 把姿勢畫成一張直式參考卡（canvas），給子母畫面（PiP）浮在原生相機上用。
// PiP 視窗跟主題無關，固定用深色底，在相機畫面上比較顯眼。

export const CARD_WIDTH = 540;
export const CARD_HEIGHT = 720;

const COLORS = {
    bg: '#1d1b33',
    main: '#ececf6',
    partner: '#9aa8f0',
    scene: 'rgba(236, 236, 246, 0.35)',
    sceneFill: 'rgba(236, 236, 246, 0.12)',
    gold: '#f0b25a',
    muted: '#a3a6c4',
};

const FONT = '-apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", sans-serif';

const VIEWBOX = {full: [0, 0, 120, 150], wide: [0, 0, 120, 150], half: [24, 0, 72, 90]} as const;

/** 依寬度把一段文字切成多行（中文逐字切） */
export function wrapText(text: string, maxWidth: number, measure: (s: string) => number): string[] {
    const lines: string[] = [];
    let line = '';
    for (const ch of text) {
        if (line && measure(line + ch) > maxWidth) {
            lines.push(line);
            line = ch;
        } else {
            line += ch;
        }
    }
    if (line) {
        lines.push(line);
    }
    return lines;
}

/** stamp：畫在右下角的小字（實驗頁用來看畫面是否還在更新） */
export function drawPoseCard(ctx: CanvasRenderingContext2D, pose: Pose, stamp?: string) {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // 示意圖：4:5 的框，置中在上半部
    const box = {x: 138, y: 28, w: 264, h: 330};
    const [vx, vy, vw] = VIEWBOX[pose.framing];
    const scale = box.w / vw;
    ctx.save();
    ctx.beginPath();
    ctx.rect(box.x, box.y, box.w, box.h);
    ctx.clip();
    ctx.translate(box.x - vx * scale, box.y - vy * scale);
    ctx.scale(scale, scale);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const prop of pose.props ?? []) {
        const path = new Path2D(prop.d);
        if (prop.kind === 'fill') {
            ctx.fillStyle = COLORS.sceneFill;
            ctx.fill(path);
        } else if (prop.kind === 'object') {
            ctx.fillStyle = COLORS.gold;
            ctx.fill(path);
        } else {
            ctx.setLineDash(prop.kind === 'guide' ? [3, 3] : []);
            ctx.strokeStyle = COLORS.scene;
            ctx.lineWidth = prop.kind === 'guide' ? 0.8 : 1.4;
            ctx.stroke(path);
        }
    }
    ctx.setLineDash([]);

    for (const person of pose.people) {
        const shapes = personShapes(person, {legs: pose.framing !== 'half'});
        const color = person.tone === 'main' ? COLORS.main : COLORS.partner;
        ctx.strokeStyle = color;
        ctx.lineWidth = shapes.stroke;
        for (const d of shapes.paths) {
            ctx.stroke(new Path2D(d));
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(shapes.head.cx, shapes.head.cy, shapes.head.r, 0, Math.PI * 2);
        ctx.fill();
    }

    // 鏡頭高度虛線
    const camY = cameraY(pose.people[0], pose.camera.height);
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 2.5]);
    ctx.beginPath();
    ctx.moveTo(vx + 10, camY);
    ctx.lineTo(vx + vw, camY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(vx + 1.5, camY - 3, 7, 6);
    ctx.restore();

    // 文字：標題、口令、拍的人
    const padX = 36;
    const maxW = CARD_WIDTH - padX * 2;
    let y = box.y + box.h + 52;
    ctx.fillStyle = COLORS.main;
    ctx.font = `bold 34px ${FONT}`;
    ctx.fillText(pose.title, padX, y);

    ctx.font = `24px ${FONT}`;
    y += 18;
    for (const [i, cue] of pose.cues.entries()) {
        const lines = wrapText(cue, maxW - 32, (s) => ctx.measureText(s).width);
        y += 38;
        ctx.fillStyle = COLORS.muted;
        ctx.fillText(String(i + 1), padX, y);
        ctx.fillStyle = COLORS.main;
        for (const [j, line] of lines.entries()) {
            ctx.fillText(line, padX + 32, y + j * 32);
        }
        y += (lines.length - 1) * 32;
    }

    ctx.fillStyle = COLORS.gold;
    ctx.font = `bold 24px ${FONT}`;
    ctx.fillText(`${CAMERA_HEIGHT_LABEL[pose.camera.height]}，${pose.camera.zoom}`, padX, CARD_HEIGHT - 36);

    if (stamp) {
        ctx.fillStyle = COLORS.muted;
        ctx.font = `20px ${FONT}`;
        ctx.textAlign = 'right';
        ctx.fillText(stamp, CARD_WIDTH - padX, CARD_HEIGHT - 36);
        ctx.textAlign = 'left';
    }
}
