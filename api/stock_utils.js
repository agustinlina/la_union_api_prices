const path = require('path')
const XLSX = require('xlsx')

// Parseo robusto: respeta miles y decimales locales
function parsePrecioCell (cell) {
  const val = cell ? cell.v ?? cell.w ?? '' : ''
  if (typeof val === 'number') return val

  let s = String(val).trim()
  if (!s) return null

  // Quitar símbolos y espacios
  s = s.replace(/\s/g, '').replace(/[^0-9.,\-]/g, '')

  const hasDot = s.includes('.')
  const hasComma = s.includes(',')

  if (hasDot && hasComma) {
    // 1.234.567,89 -> 1234567.89
    s = s.replace(/\./g, '').replace(',', '.')
  } else if (hasDot && !hasComma) {
    // 102.800 -> 102800 (punto como miles)
    s = s.replace(/\./g, '')
  } else if (!hasDot && hasComma) {
    // 102,80 -> 102.80
    s = s.replace(',', '.')
  }

  const n = Number(s)
  return Number.isNaN(n) ? null : n
}

function leerStockExcel (nombreArchivo) {
  const ruta = path.join(__dirname, 'files', nombreArchivo)
  const workbook = XLSX.readFile(ruta)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]

  // Intentaremos detectar si el precio está en la misma fila (offset 0)
  // o en la fila siguiente (offset 1). Tu nuevo archivo usa offset=1 (A1/B2).
  let fila = 1 // ahora partimos en A1
  let offset = null // se detecta la primera vez que haya datos
  const productos = []
  let vaciasSeguidas = 0

  while (true) {
    const cA = sheet['A' + fila]
    const codigo = cA ? String(cA.v ?? cA.w ?? '').trim() : ''

    // Detectar offset una sola vez cuando encontremos la primera fila útil
    let precio = null
    if (offset === null) {
      // Mirar B[fila] y B[fila+1] para decidir
      const pSame = parsePrecioCell(sheet['B' + fila])
      const pNext = parsePrecioCell(sheet['B' + (fila + 1)])
      if (pSame !== null) {
        offset = 0 // formato A2/B2 (misma fila)
        precio = pSame
      } else if (pNext !== null) {
        offset = 1 // formato A1/B2 (desfasado +1)
        precio = pNext
      } else {
        // todavía no sabemos; seguimos avanzando
        // precio se queda null por ahora
      }
    } else {
      // Ya sabemos el offset: tomar B[fila + offset]
      precio = parsePrecioCell(sheet['B' + (fila + offset)])
    }

    // Criterio de corte: si no hay código ni precio candidato varias filas seguidas, cortamos
    if (!codigo && precio === null) {
      vaciasSeguidas++
      if (vaciasSeguidas >= 5) break // margen por espacios en blanco finales
    } else {
      vaciasSeguidas = 0
    }

    // Guardar fila válida (si hay código o precio)
    if (codigo || precio !== null) {
      productos.push({ codigo, precio })
    }

    fila++
    // Seguridad: no iterar infinito (por si hubiera basura lejos)
    if (fila > 100000) break
  }

  return productos
}

module.exports = { leerStockExcel }
