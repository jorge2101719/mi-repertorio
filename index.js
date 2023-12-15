import express from 'express';
import { writeFile, readFile } from 'node:fs/promises';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const getCanciones = async () => {
  try {
    const res = await readFile('repertorio.json', 'utf-8');
    const canciones = JSON.parse(res);
    return canciones;
  } catch (error) {
    console.log('Error al leer el archivo repertorio.json.', error.message);
    if (error.code === 'ENOENT') {
      const nuevasCanciones = [];
      await writeFile('repertorio.json', JSON.stringify(nuevasCanciones));
      return nuevasCanciones;
    }
  }
};

const guardarCanciones = async (repertorio) => {
  try {
    await writeFile('repertorio.json', JSON.stringify(repertorio));
    console.log('Escritura de repertorio.json exitosa.');
  } catch (error) {
    console.log('Error al escribir en el archivo repertorio.json.', error.message);
  }
};

// GET /index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

// GET /canciones
app.get('/canciones', async (req, res) => {
  const repertorio = await getCanciones();
  res.json(repertorio);
});


// POST /canciones
app.post('/canciones', async (req, res) => {
  const { id, titulo, artista, tono } = req.body;
  const nuevaCancion = { id, titulo, artista, tono };

  if ( !nuevaCancion.titulo.trim() || !nuevaCancion.artista.trim() || !nuevaCancion.tono.trim() ) {
    return res.status(401).json({
      message: 'Debe completar todos los campos...',
    });
  }

  const canciones = await getCanciones();
  const index = canciones.some((cancion) => cancion.id === nuevaCancion.id);

  if (index) {
    return res.status(401).json({
      message: 'La canción ya existe.',
    });
  }

  canciones.push(nuevaCancion);
  await guardarCanciones(canciones);

  res.status(201).json({ message: 'La canción agregada exitosamente...' });
});

// PUT /canciones/:id
app.put('/canciones/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { titulo, artista, tono } = req.body;

  if (!titulo.trim() || !artista.trim() || !tono.trim()) {
    return res.status(401).json({ message: 'La canción no puede tener campos vacíos.', });
  }

  const repertorio = await getCanciones();
  const index = repertorio.findIndex(c => c.id === id);

  if (index !== -1) {
    repertorio[index] = { id, titulo, artista, tono };
    await guardarCanciones(repertorio);
    res.json({ message: 'La canción fue actualizada exitosamente.', });
  } else {
    res.status(401).json({ message: 'No se encuentra el id de la canción.', });
  }
});

// DELETE /canciones/:id
app.delete('/canciones/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const canciones = await getCanciones();
  const nuevasCanciones = canciones.filter(c => c.id != id);

  if (canciones.length != nuevasCanciones.length) {
    await guardarCanciones(nuevasCanciones);
    res.json({ message: 'La canción fue eliminada exitosamente' });
  } else {
    res.status(401).json({ message: 'No se encuentra el id de la canción.' });
  }
});

app.use((req, res) => {
  res.status(404).send('Página no encontrada');
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});