import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import { AddressInfo } from 'net'
import db from './connection'
import { uuidv7 } from 'uuidv7'

const app = express()

app.use(express.json())
app.use(cors())

app.get('/', async (req: Request, res: Response) => {
  try {
    res.send('Hello, world!')
  } catch (e: any) {
    res.send(e.sqlMessage || e.message)
  }
})

app.post('/quadra/add/', async (req: Request, res: Response) => {
  try{
    const { nome, rua, bairro, cidade, numero, cep, locatario } = req.body

    if(!nome || !rua || !bairro || !cidade || !numero || !cep || !locatario){
      throw new Error('Campos inválidos')
    }

    const id_quadra = uuidv7() as string
    const id_endereco = uuidv7() as string

    await db.transaction(async (trx) => {
      await trx('endereco')
        .insert({
          id_endereco,
          rua,
          bairro,
          cidade,
          numero,
          cep
        })
      await trx('quadra')
        .insert({
          id_quadra,
          nome,
          id_endereco
        })
    })

    res.status(201).send('Quadra criada com sucesso')
  }catch(err: any){
    res.status(400).send(err.message)
  } 
})

app.post('/horario/add', async (req: Request, res: Response) => {
  try{
    const { id_quadra, id_dia_semana, horario_inicial, horario_final, preco } = req.body

    if(!id_quadra || !id_dia_semana || !horario_inicial || !horario_final || !preco){
      throw new Error('Campos inválidos')
    }

    const quadra = await db('quadra').where('id_quadra', id_quadra)

    if(!quadra){
      throw new Error('Quadra não existe')
    }

    const diaSemana = await db('dia_semana').where('id_dia_semana', id_dia_semana)

    if(!diaSemana){
      throw new Error('Dia da semana não existe')     
    }

    const id_horario_aluguel = uuidv7() as string

    await db('horario_aluguel')
      .insert({
        id_horario_aluguel,
        id_quadra, 
        id_dia_semana, 
        horario_inicial,
        horario_final,
        preco
      })

      res.status(201).send('Horario criado com sucesso!')
  }catch(err: any){
    res.status(400).send(err.message)
  }
})

const server = app.listen(process.env.PORT || 3003, () => {
  if (server) {
    const address = server.address() as AddressInfo
    console.log(`Server is running in http://localhost:${address.port}`)
  } else {
    console.error(`Failure upon starting server.`)
  }
})