// api/api.js
const path = require('path');
const XLSX = require('xlsx');

function leerStockExcel(nombreArchivo) {
  const ruta = path.join(__dirname, 'files', nombreArchivo); // Buscamos en api/files/
  const workbook = XLSX.readFile(ruta);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  let fila = 2; // Empezar desde A2 / B2
  const productos = [];

  while (true) {
    const celdaCodigo = sheet['A' + fila];
    const celdaPrecio = sheet['B' + fila];

    const codigo = celdaCodigo ? String(celdaCodigo.v).trim() : '';
    const precioRaw = celdaPrecio !== undefined ? celdaPrecio.v : null;

    const precioVacio = (precioRaw === null || precioRaw === undefined || String(precioRaw).trim?.() === '');
    if (!codigo && precioVacio) break;

    const precio = precioVacio ? null : Number(precioRaw);

    productos.push({ codigo, precio });
    fila++;
  }

  return productos;
}

function getStockOlav() {
  return leerStockExcel('olav.xls');
}

function getStockCba() {
  return leerStockExcel('cba.xls');
}

function getStockPolo() {
  return leerStockExcel('polo.xls');
}

function getPrices() {
  return leerStockExcel('prices.xlsx'); // ahora usa el mismo formato
}

module.exports = {
  getPrices
};
