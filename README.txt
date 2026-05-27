# Tu nueva web

Este ZIP contiene la web lista para publicar.

## Archivos

- `index.html` — la web completa
- `assets/` — imagenes, logo, iconos

## Como publicarla (3 opciones)

### 1. Hosting cualquiera (Hostinger, Raiola, SiteGround, etc.)
Sube la carpeta entera al hosting via FTP o panel de archivos.
Asegurate de que `index.html` este en la raiz del dominio.

### 2. GitHub Pages / Netlify / Vercel (gratis)
Arrastra la carpeta al dashboard de Netlify (https://app.netlify.com/drop).
En 30 segundos tienes URL publica.

### 3. Servidor propio
```
scp -r * usuario@tu-servidor:/var/www/html/
```

## Edicion

Abre `index.html` con cualquier editor de texto (VS Code, Notepad++, etc.).
Los textos estan en espanol. Cambia lo que necesites.
Para cambiar colores: busca al principio del archivo `--primary:` y cambia el hex.
