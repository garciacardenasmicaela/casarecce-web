import { LOCAL_INFO } from '../../core/config/local.config';

export interface SeccionLegal {
  titulo: string;
  parrafos: string[];
}

export interface DocumentoLegal {
  titulo: string;
  secciones: SeccionLegal[];
}

/**
 * Textos base de privacidad y términos.
 * IMPORTANTE: son un modelo general. Antes de publicar, completar los datos del titular
 * (razón social, CUIT, domicilio, email de contacto) y revisarlos con un profesional.
 */
const titular = `${LOCAL_INFO.nombre}, ${LOCAL_INFO.ciudad}`;

export const DOCUMENTOS_LEGALES: Record<'privacidad' | 'terminos', DocumentoLegal> = {
  privacidad: {
    titulo: 'Política de Privacidad',
    secciones: [
      {
        titulo: 'Quién es responsable de tus datos',
        parrafos: [`El responsable del tratamiento es ${titular}. Podés contactarnos por WhatsApp (${LOCAL_INFO.whatsappTexto}) para cualquier consulta sobre tus datos.`],
      },
      {
        titulo: 'Qué datos pedimos y para qué',
        parrafos: [
          'Pedidos: tu nombre, WhatsApp y, si querés, tu email, para preparar y coordinar tu pedido.',
          'Beneficio de 10% OFF en la primera compra: tu nombre, DNI y email. El DNI se usa únicamente para verificar que el beneficio se otorgue una sola vez por persona y para validarlo al retirar el pedido.',
          'Novedades: si dejás tu email en el pie de página, lo usamos solo para avisarte de especiales y promociones.',
        ],
      },
      {
        titulo: 'Con quién los compartimos',
        parrafos: [
          'No vendemos ni cedemos tus datos. Se almacenan en un proveedor de infraestructura (Supabase) y, si está activado, los emails se envían mediante un servicio de correo (Brevo). Ambos tratan los datos solo para prestarnos el servicio.',
          'Tu pedido se envía por WhatsApp desde tu propio teléfono, bajo las condiciones de esa aplicación.',
        ],
      },
      {
        titulo: 'Tus derechos',
        parrafos: [
          'Según la Ley 25.326 de Protección de Datos Personales, podés acceder, rectificar y pedir la supresión de tus datos en cualquier momento, escribiéndonos por WhatsApp.',
          'La Agencia de Acceso a la Información Pública (AAIP) es el órgano de control de la ley y atiende denuncias y reclamos por incumplimientos.',
        ],
      },
      {
        titulo: 'Cuánto tiempo los guardamos',
        parrafos: ['Conservamos tus datos mientras sean necesarios para las finalidades indicadas o hasta que pidas su eliminación.'],
      },
    ],
  },
  terminos: {
    titulo: 'Términos y Condiciones',
    secciones: [
      {
        titulo: 'Cómo funcionan los pedidos',
        parrafos: [
          'La web arma tu pedido y lo envía como mensaje de WhatsApp al local. El pedido queda confirmado cuando el local te responde.',
          'Los precios y el stock pueden variar; el local te confirmará cualquier diferencia antes de preparar tu pedido.',
          'Con el local cerrado podés enviar tu pedido como encargo: se prepara a partir de la próxima apertura.',
        ],
      },
      {
        titulo: 'Entrega y pago',
        parrafos: [
          'Podés retirar por el local o coordinar un envío por Uber Flash / cadetería, cuyo costo corre por cuenta del cliente.',
          'El pago se realiza por transferencia o en efectivo, según lo acordado por WhatsApp.',
        ],
      },
      {
        titulo: 'Beneficio de 10% OFF',
        parrafos: [
          'Es válido para la primera compra, una vez por persona (controlado por DNI), con el código recibido por email, hasta 7 días desde su emisión.',
          'No es acumulable con otras promociones y puede ser verificado al retirar el pedido.',
        ],
      },
      {
        titulo: 'Productos',
        parrafos: ['Las fotos son ilustrativas. Los productos son artesanales y frescos: consultá por conservación y tiempos de consumo.'],
      },
    ],
  },
};
