import path from 'node:path'
import fs from 'node:fs/promises'
import { pool } from './db.js'

export const index = async (req, res) => {
  const ruta = path.resolve('./public/index.html')
  const contenido = await fs.readFile(ruta, 'utf-8')
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(contenido)
}

export const getUsuarios = async (req, res) => {
  const resultado = await pool.query('SELECT * FROM users')
  const usuarios = resultado[0]
  const stringData = JSON.stringify(usuarios)

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(stringData)
}

export const exportUsuarios = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM users')
    const usuarios = resultado[0]

    const cabeceras = Object.keys(usuarios[0]).join(',')

    const filas = usuarios.reduce((acc, usuario) => {
      const string = `\n${usuario.id},${usuario.nombres},${usuario.apellidos},${usuario.direccion},${usuario.email},${usuario.dni},${usuario.edad},${usuario.fecha_creacion},${usuario.telefono}`
      return acc + string
    }, '')

    const contenido = cabeceras + filas

    await fs.writeFile('usuarios.csv', contenido)

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        message: 'Datos de los usuarios exportados al archivo usuarios.csv'
      })
    )
  } catch (error) {
    console.log(error)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Error interno del servidor' }))
  }
}

export const importUsuarios = async (req, res) => {
  try {
    const contenido = await fs.readFile('usuarios.csv', 'utf-8')
    const filas = contenido.split('\n')

    filas.shift()

    for (const fila of filas) {
      const valores = fila.split(',')

      const nombres = valores[1]
      const apellidos = valores[2]
      const direccion = valores[3]
      const email = valores[4]
      const dni = valores[5]
      const edad = valores[6]
      const fechaCreacion = valores[7]
      const telefono = valores[8]

      try {
        await pool.query(
          'INSERT INTO users (nombres, apellidos, direccion, email, dni, edad, fecha_creacion, telefono) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [nombres, apellidos, direccion, email, dni, edad, fechaCreacion, telefono]
        )
        console.log('Se inserto el usuario:', nombres)
      } catch (error) {
        if (error.errno === 1062) {
          console.log('No se inserto el usuario (duplicado):', nombres)
          continue
        }
        console.error('Error al insertar el usuario:', error)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ message: 'Error en la importacion' }))
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Datos importados' }))
  } catch (error) {
    console.error('Error al leer el archivo:', error)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Error al leer el archivo' }))
  }
}
