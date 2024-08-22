import express from 'express';
import cors from 'cors';

const app = express();

// Permitir todas las solicitudes CORS
app.use(cors());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

// Ruta /data que devuelve un JSON
app.get('/data', (req, res) => {
  res.json([
    { id: 1, title: 'Post 1', author: 'Author 1' },
    { id: 2, title: 'Post 2', author: 'Author 2' }
  ]);
});

// Escuchar en el puerto 5500
app.listen(5500, () => console.log('Server running on port 5500'));
