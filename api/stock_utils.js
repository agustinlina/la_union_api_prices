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

    const codigo = cA ? String(cA.v ?? cA.w ?? '').trim() : '';

    // Tomar valor crudo (v) o formateado (w)
    const precioRaw = cB ? (cB.v ?? cB.w ?? '') : '';

    const sinPrecio = precioRaw === null || precioRaw === undefined || String(precioRaw).trim() === '';
    if (!codigo && sinPrecio) break;

    let precio = null;
    if (!sinPrecio) {
      if (typeof precioRaw === 'number') {
        // Si Excel lo tiene como número, usarlo tal cual
        precio = precioRaw;
      } else {
        // Si es texto, limpiar $ y espacios pero NO tocar puntos
        let s = String(precioRaw)
          .replace(/\s/g, '')         // quitar espacios
          .replace(/[^0-9.,\-]/g, ''); // quitar símbolos extraños

        // Si tiene coma como decimal, convertirla a punto
        if (s.includes(',') && /\d,\d{1,2}$/.test(s)) {
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
