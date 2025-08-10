const path = require('path'); 
const XLSX = require('xlsx');

function leerStockExcel(nombreArchivo) {
  const ruta = path.join(__dirname, 'files', nombreArchivo);
  const workbook = XLSX.readFile(ruta);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  let fila = 2; // Comenzamos en A2 / B2
  const productos = [];

  while (true) {
    const celdaCodigo = sheet['A' + fila];
    const celdaPrecio = sheet['B' + fila];

    const codigo = celdaCodigo ? String(celdaCodigo.v).trim() : '';
    const precioRaw = celdaPrecio !== undefined ? celdaPrecio.v : null;

    // Si no hay más datos (fila vacía), cortamos
    const precioVacio = (precioRaw === null || precioRaw === undefined || String(precioRaw).trim?.() === '');
    if (!codigo && precioVacio) break;

    // Normalizar precio a número si es posible (si viene texto, intenta Number)
    const precio = precioVacio ? null : Number(precioRaw);

    productos.push({ codigo, precio });
    fila++;
  }

  return productos;
}

module.exports = { leerStockExcel };
