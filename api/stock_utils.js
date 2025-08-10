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

    // ¿Está vacía la fila?
    const sinPrecio = precioRaw === null || precioRaw === undefined || String(precioRaw).trim() === '';
    if (!codigo && sinPrecio) break;

    // Normalizar string y convertir a número
    let precio = null;
    if (!sinPrecio) {
      let s = String(precioRaw)
        .replace(/\s/g, '')               // quitar espacios
        .replace(/[^0-9.,\-]/g, '');      // dejar solo dígitos y separadores

      // Si hay . y , asumimos formato AR: . miles, , decimales
      if (s.includes('.') && s.includes(',')) {
        s = s.replace(/\./g, '').replace(',', '.');
      } else {
        // Si hay muchos puntos, probablemente sean miles
        const puntos = (s.match(/\./g) || []).length;
        const comas = (s.match(/,/g) || []).length;
        if (puntos > 1 && comas === 0) s = s.replace(/\./g, '');
        if (comas > 1 && puntos === 0) s = s.replace(/,/g, ''); // caso raro
      }

      const n = Number(s);
      if (!Number.isNaN(n)) precio = n;
    }

    productos.push({ codigo, precio });
    fila++;
  }

  return productos;
}

module.exports = { leerStockExcel };
