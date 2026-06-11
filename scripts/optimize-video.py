#!/usr/bin/env python3
"""
optimize-video.py — Reduce al máximo el peso de un vídeo para usarlo como hero web,
sin pérdida de calidad perceptible (va detrás de un overlay oscuro + texto).

Qué hace:
  - Quita el audio (un hero se reproduce muteado -> ahorro directo).
  - Genera MP4 (H.264) para compatibilidad universal.
  - Genera WebM (VP9) que suele pesar 30-50% menos a igual calidad.
  - Activa +faststart (el MP4 empieza a reproducir sin descargar entero).
  - Mantiene resolución y fps originales (no reescala -> no pierde nitidez).

Uso:
  python scripts/optimize-video.py "ruta/al/video.mp4" [carpeta_salida] [--crf 24] [--webm-crf 34]

Requiere imageio-ffmpeg (pip install imageio-ffmpeg) — trae un ffmpeg estático, sin admin.
"""
import argparse, os, subprocess, sys
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

def ffmpeg_bin():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        sys.exit("Falta imageio-ffmpeg. Instala con: python -m pip install imageio-ffmpeg")

def kb(path):
    return os.path.getsize(path) // 1024

def run(cmd):
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if p.returncode != 0:
        print(p.stdout[-1500:])
        sys.exit(f"ffmpeg falló (código {p.returncode})")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("outdir", nargs="?", default="assets/video")
    ap.add_argument("--name", default="hero", help="nombre base de salida")
    ap.add_argument("--crf", type=int, default=24, help="calidad H.264 (menor = mejor, 18-28)")
    ap.add_argument("--webm-crf", type=int, default=34, help="calidad VP9 (menor = mejor, 28-40)")
    ap.add_argument("--maxwidth", type=int, default=0, help="ancho máx en px (0 = no reescalar)")
    args = ap.parse_args()

    ff = ffmpeg_bin()
    os.makedirs(args.outdir, exist_ok=True)
    mp4 = os.path.join(args.outdir, args.name + ".mp4")
    webm = os.path.join(args.outdir, args.name + ".webm")

    scale = []
    if args.maxwidth:
        scale = ["-vf", f"scale='min({args.maxwidth},iw)':-2"]

    src_kb = kb(args.input)
    print(f"Original: {src_kb} KB\n")

    # MP4 H.264 — compatibilidad universal, faststart, sin audio
    print("→ Generando MP4 (H.264)...")
    run([ff, "-y", "-i", args.input, *scale,
         "-an",                          # sin audio
         "-c:v", "libx264", "-preset", "veryslow",
         "-crf", str(args.crf),
         "-pix_fmt", "yuv420p",          # compat máxima (Safari/iOS)
         "-movflags", "+faststart",
         "-profile:v", "high", "-level", "4.0",
         mp4])
    print(f"  MP4:  {kb(mp4)} KB")

    # WebM VP9 — mejor compresión para navegadores modernos
    print("→ Generando WebM (VP9)...")
    run([ff, "-y", "-i", args.input, *scale,
         "-an",
         "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", str(args.webm_crf),
         "-row-mt", "1", "-cpu-used", "2",
         "-pix_fmt", "yuv420p",
         webm])
    print(f"  WebM: {kb(webm)} KB")

    best = min(kb(mp4), kb(webm))
    print(f"\n=== Original {src_kb} KB -> mejor {best} KB  ({100 - round(best*100/src_kb)}% menos) ===")

if __name__ == "__main__":
    main()
