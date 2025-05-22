import { randomUUID } from "crypto";
import express from "express";
import fs from "fs";


const server = express();
const PORT = 8000;
const LOG_FILE = "logs.json";


server.use(express.json());




function readLogs(callback) {
  fs.readFile(LOG_FILE, "utf-8", (err, data) => {
    if (err && err.code !== "ENOENT") {
      return callback(err, null);
    }


    let logs = [];
    try {
      logs = data ? JSON.parse(data) : [];
    } catch (parseError) {
      return callback(parseError, null);
    }


    callback(null, logs);
  });
}
function writeLogs(logs, callback) {
  fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2), (err) => {
    callback(err);
  });
}




server.post("/logs/registros", (request, response) => {
  const { name } = request.body;


  if (!name) {
    return response.status(400).json({ error: "O campo 'name' é obrigatório." });
  }


  const newUser = {
    id: randomUUID(),
    name,
    dateRequested: new Date().toISOString(),
  };


  readLogs((err, logs) => {
    if (err) return response.status(500).json({ error: "Erro ao ler os logs." });


    logs.push(newUser);


    writeLogs(logs, (err) => {
      if (err) return response.status(500).json({ error: "Erro ao salvar o registro." });


      return response.status(201).json({ message: "Registro criado com sucesso.", data: newUser });
    });
  });
});
