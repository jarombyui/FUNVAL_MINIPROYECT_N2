import http from 'node:http'
import { PORT } from './config.js'
// import { pool } from "./db.js"; //3
import { exportUsuarios, getUsuarios, importUsuarios, index } from './controller.js'

const server = http.createServer(async (req, res) => {
  const { url, method } = req // deestructuracion

  if (method === 'GET') {
    switch (url) {
      case '/':
        index(req, res)
        break

      case '/api/users':
        // 2
        getUsuarios(req, res)
        break

      case '/api/users/export':
        exportUsuarios(req, res)
        break

      case '/api/users/import':
        importUsuarios(req, res)
        break

      default:
        res.end('Ruta no encontrada')
        break
    }
  }

  if (method === 'POST') {
    // Metodos para rutas en post
  }
})

server.listen(PORT, () => console.log('servidor ejecutandose!'))
