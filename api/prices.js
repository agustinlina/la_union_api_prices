const { leerStockExcel } = require('./stock_utils');

export default function handler(req, res) {
  try {
    const productos = leerStockExcel('prices.xlsx'); // ahora lee prices.xlsx
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo leer prices.xlsx' });
  }
}
