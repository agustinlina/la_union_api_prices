const path = require('path'); 
const XLSX = require('xlsx');

function leerStockExcel(nombreArchivo) {
  const ruta = path.join(__dirname, 'files', nombreArchivo);
  const workbook = XLSX.readFile(ruta);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  let fila = 2; // A2/B2
  const productos = [];

  while (true) {
    const cA = sheet['A' + fila];
    const cB = sheet['B' + fila];

    const codigo = cA ? String((cA.v ?? cA.w ?? '')).trim() : '';
    const precioRaw = cB !== undefined ? (cB.v ?? cB.w ?? '') : '';

    const sinPrecio = precioRaw === null || precioRaw === undefined || String(precioRaw).trim() === '';
    if (!codigo && sinPrecio) break;

    let precio = null;

    if (!sinPrecio) {
      if (typeof precioRaw === 'number') {
        // Si Excel lo tiene como número real, usar tal cual (ya es 102800, por ejemplo).
        precio = precioRaw;
      } else {
        // Texto: respetar miles con punto y decimales con coma (AR)
        let s = String(precioRaw)
          .replace(/\s/g, '')           // quitar espacios
          .replace(/[^0-9.,\-]/g, '');  // quitar símbolos (ej: $)

        const hasDot = s.includes('.');
        const hasComma = s.includes(',');

        if (hasDot && hasComma) {
          // Formato típico AR: 1.234.567,89 -> 1234567.89
          s = s.replace(/\./g, '').replace(',', '.');
        } else if (hasDot && !hasComma) {
          // Solo puntos: tratarlos como separadores de miles -> quitar puntos
          // 102.800 -> 102800 ; 1.234.567 -> 1234567
          s = s.replace(/\./g, '');
        } else if (!hasDot && hasComma) {
          // Solo coma: asumir decimal -> cambiar a punto
          // 102,80 -> 102.80
          s = s.replace(',', '.');
        }
        const n = Number(s);
        if (!Number.isNaN(n)) precio = n;
      }
    }

    productos.push({ codigo, precio });
    fila++;
  }

  return productos;
}

module.exports = { leerStockExcel };
