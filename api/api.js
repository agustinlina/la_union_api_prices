// api/api.js
const path = require('path');
const XLSX = require('xlsx');

function leerStockExcel(nombreArchivo) {
  const ruta = path.join(__dirname, nombreArchivo); // Buscamos dentro de api/
  const workbook = XLSX.readFile(ruta);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  let fila = 10;
  let productos = [];
  while (true) {
    const codigo = sheet['A' + fila] ? String(sheet['A' + fila].v).trim() : '';
    const descripcion = sheet['C' + fila] ? String(sheet['C' + fila].v).trim() : '';
    const rubro = sheet['F' + fila] ? String(sheet['F' + fila].v).trim() : '';
    const stock = sheet['H' + fila] ? String(sheet['H' + fila].v).trim() : '';

    if (!codigo && !descripcion) break;

    productos.push({ codigo, descripcion, rubro, stock });
    fila++;
  }
  return productos;
}

// NUEVO: lector de prices.xlsx (A2: código, B2: precio)
function leerPricesExcel(nombreArchivo) {
  const ruta = path.join(__dirname, 'files', nombreArchivo); // api/files/prices.xlsx
  const workbook = XLSX.readFile(ruta);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  let fila = 2;
  const items = [];
  while (true) {
    const cA = sheet['A' + fila];
    const cB = sheet['B' + fila];

    const codigo = cA ? String(cA.v).trim() : '';
    const precioRaw = cB !== undefined ? cB.v : null;

    // si no hay más datos, cortamos
    if (!codigo && (precioRaw === null || precioRaw === undefined || String(precioRaw).trim() === '')) break;

    // normalizar precio a número si es posible
    const precio = (precioRaw === null || precioRaw === undefined || String(precioRaw).trim() === '')
      ? null
      : Number(precioRaw);

    items.push({ codigo, precio });
    fila++;
  }
  return items;
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

// NUEVO: export para /api/prices
function getPrices() {
  // Asegurate que el archivo exista en api/files/prices.xlsx
  return leerPricesExcel('prices.xlsx'); // ← extensión correcta
}

module.exports = {
  getStockOlav,
  getStockCba,
  getStockPolo,
  getPrices, // ← exportado
};
