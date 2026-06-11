# Convierte los PNG de assets/img a WebP (calidad 82) y borra el PNG original.
# Reutilizable: ejecútalo cada vez que haya nuevos PNG generados.
import glob, os
from PIL import Image

src = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')
done = 0
for png in glob.glob(os.path.join(src, '*.png')):
    webp = png[:-4] + '.webp'
    img = Image.open(png).convert('RGB')
    img.save(webp, 'WEBP', quality=82, method=6)
    kb_old = os.path.getsize(png) // 1024
    kb_new = os.path.getsize(webp) // 1024
    os.remove(png)
    print(f'{os.path.basename(webp)}: {kb_old}KB -> {kb_new}KB')
    done += 1
print(f'--- convertidas {done} imagenes')
