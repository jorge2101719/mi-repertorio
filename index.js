import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync, writeFileSync } from 'fs';
// import { readFie, writeFile } from 'fs:node/promises';
// import cors from 'cors';
// import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Instanciamos express
const app = express();

// activación de middleware para enviar información al servidor
app.use(express.json());
// app.use(cors());

// Levantamos el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`¡Servidor encendido! Puerto http://localhost:${PORT}`)
});


// Lo que sigue, es básicamente lo que aparece en la guía de estudio

// Uso del método GET en la raíz para que devuelva en archivo index.html
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
})

// Comprobamos si canciones.json tiene o no elementos
app.get('/canciones', (req, res) => {
	try {
		const canciones = JSON.parse(readFileSync('canciones.json'));

		if(canciones.length === 0) {
			res.status(404).send('La lista de canciones está vacía')
		} else {
			res.status(200).json(canciones);
		}} catch(error){
			console.log(error);
			res.status(500).send('Nos apena decir que algo salió mal... Inténtelo más tarde');
		}
});

// --------------------------------------------------

// Método POST para agregar una canción // tiene un problema que no he podido resolver
app.post('/canciones', (req, res) => {
	try{
		const cancion = req.body;
		const canciones = JSON.parse(readFileSync('canciones.json'));
		canciones.push(cancion);
		writeFileSync('canciones.json', JSON.stringify(canciones));
		res.send('Hemos agregado nuestro primer tema...')				
	} catch(error) {
		console.log(error)
		res.status(500).send('Algo salió mal...')
	}
});

// Método DELETE (borrar)
app.delete('/canciones/:id', (req, res) => {
	try {
		const { id } = req.params;
		const canciones = JSON.parse(readFileSync('canciones.json'));
		const index = canciones.findIndex(c => c.id == parseInt(id));
		//
		if(index !== -1) {
			canciones.splice(index, 1);
			writeFileSync('canciones.json', JSON.stringify(canciones));
			res.send('Canción eliminada con éxito')
		} else {
			res.status(404).send('No se ha encontrado la canción...');
		}	
	} catch(error) {
		console.log(error);
		res.status(500).send('Algo salió mal...');
	}
});

//  Método PUT (modificar)
app.put('/canciones/:id', (req, res) => {
	try {
		const { id } = req.params;
		const cancion = req.body;
		const canciones = JSON.parse(readFileSync('canciones.json'));
		const index = canciones.findIndex(c => c.id == parseInt(id));
		// 
		if(index !== -1) {
			canciones[index] = cancion;
			writeFileSync('canciones.json', JSON.stringify(canciones));
			res.status(200).send('Canción modificacada con éxito');
		} else {
			res.status(404).send('La canción no ha sido encontrada...')
		}
	} catch(error) {
		consoleg.log(error);
		res.send('Algo salió mal...')
	}
});

// Manejo de error 404
app.use((req, res) => {
	res.status(404).send('página no encontrada')
})