# Revisi?n visual y de accesibilidad

Se aplicaron las pautas de Impeccable y Apple Design a agenda, b?squeda, navegaci?n y detalle de pacientes.

Hallazgos corregidos:
- P1: el reset sin capa anulaba las utilidades de espaciado de Tailwind. Se movi? a la capa base; recupera padding y m?rgenes en toda la app.
- P1: la lupa se superpon?a con el texto. Ahora ocupa su propia columna flexible y el placeholder tiene contraste legible.
- P1: las pesta?as inactivas quedaban fuera de la navegaci?n con Tab. Todas son accesibles y la ruta actual usa aria-current.
- P2: textos y acciones del perfil demasiado peque?os. Texto principal de 16 px, t?tulos de 22 px, iconos de acciones de 28 px y controles de cabecera de al menos 44 px.
- P2: selecci?n pegada al borde inferior. La barra tiene 8 px de espacio interior y separaci?n entre botones.
- P2: estado vac?o pegado al encabezado. Recupera espaciado, con 56 px superiores y un bot?n de al menos 48 px.
- P2: tema apagado. Verde esmeralda para acciones y selecci?n, frambuesa y coral como acentos; superficies claras.
- P3: promoci?n permanente de todos los controles a capas de composici?n. Se elimin? will-change generalizado.

Se conservan foco visible, respuesta al presionar, estados y navegaci?n existentes. Se respetan preferencias de movimiento y transparencia reducidos; las fotos del perfil se cargan de forma diferida.

Validaci?n: build de producci?n correcto. La inspecci?n visual m?vil/escritorio queda pendiente porque la sesi?n no dispone de navegador. El motor autom?tico de Impeccable no pudo cargar por falta de instalaci?n y permisos de cach?; revisi?n manual de sus pautas, sin atribuir resultados a su detector.
