import { CodigoDescuento, EstadoCodigo } from '../models';

/** "abcd-ef gh" -> "ABCDEFGH" */
export const normalizarCodigo = (texto: string) => texto.replace(/[^a-z0-9]/gi, '').toUpperCase();

/** "ABCDEFGH" -> "ABCD-EFGH" */
export function formatearCodigo(codigo: string) {
  const c = normalizarCodigo(codigo);
  return c.length === 8 ? `${c.slice(0, 4)}-${c.slice(4)}` : c;
}

export function estadoDeCodigo(c: CodigoDescuento, ahora = Date.now()): EstadoCodigo {
  if (c.usado_at) return 'usado';
  return new Date(c.expira_at).getTime() <= ahora ? 'vencido' : 'vigente';
}

export const ETIQUETA_ESTADO: Record<EstadoCodigo, string> = {
  vigente: 'Vigente',
  usado: 'Usado',
  vencido: 'Vencido',
};

/** Código de 8 caracteres sin letras confusas (solo se usa en modo demo; en producción lo genera la base). */
export function generarCodigoDemo(): string {
  const alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => alfabeto[Math.floor(Math.random() * alfabeto.length)]).join('');
}

export const DIAS_VIGENCIA = 7;
