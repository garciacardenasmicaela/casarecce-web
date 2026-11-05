/**
 * Reduce una foto antes de subirla: máximo 1200 px de ancho y formato WebP.
 * Una foto de celular de 4 MB pasa a pesar ~150 KB, y la web carga mucho más rápido.
 * Si el navegador no puede procesarla, se devuelve el archivo original.
 */
export async function reducirImagen(archivo: File, maxAncho = 1200, calidad = 0.82): Promise<File> {
  try {
    const bitmap = await createImageBitmap(archivo);
    const escala = Math.min(1, maxAncho / bitmap.width);
    const ancho = Math.round(bitmap.width * escala);
    const alto = Math.round(bitmap.height * escala);

    const lienzo = document.createElement('canvas');
    lienzo.width = ancho;
    lienzo.height = alto;
    lienzo.getContext('2d')!.drawImage(bitmap, 0, 0, ancho, alto);
    bitmap.close();

    const blob = await new Promise<Blob | null>(ok => lienzo.toBlob(ok, 'image/webp', calidad));
    if (!blob || blob.size >= archivo.size) return archivo; // si no mejora, se deja la original
    const nombre = archivo.name.replace(/\.[^.]+$/, '') || 'foto';
    return new File([blob], `${nombre}.webp`, { type: 'image/webp' });
  } catch {
    return archivo;
  }
}
