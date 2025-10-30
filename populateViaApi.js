// Script para borrar todos los juegos y reseñas usando el backend (API REST)
// y luego crear 50 juegos nuevos con imágenes de Steam

const fetch = require("node-fetch");

const API_URL = process.env.API_URL || "http://localhost:3000/api";

// Lista de géneros válidos según el modelo
const generosValidos = [
  "Acción",
  "RPG",
  "Estrategia",
  "Deportes",
  "Carreras",
  "Aventura",
  "Terror",
  "Simulación",
  "Puzzle",
  "Plataformas",
];

const juegosBase = [
  {
    nombre: "The Witcher 3: Wild Hunt",
    año: 2015,
    genero: "RPG",
    plataforma: "PC, PS4, Xbox One, Switch",
    imagen:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg",
    resena: "Una épica aventura de mundo abierto con Geralt de Rivia.",
    desarrollador: "CD Projekt Red",
    tienda: "Steam",
    completado: true,
    horasJugadas: 120,
  },
  {
    nombre: "Hollow Knight",
    año: 2017,
    genero: "Plataformas",
    plataforma: "PC, Switch, PS4, Xbox One",
    imagen:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    resena: "Un metroidvania desafiante y atmosférico.",
    desarrollador: "Team Cherry",
    tienda: "Steam",
    completado: false,
    horasJugadas: 40,
  },
  {
    nombre: "DOOM Eternal",
    año: 2020,
    genero: "Acción",
    plataforma: "PC, PS4, Xbox One, Switch",
    imagen:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/782330/header.jpg",
    resena: "Acción frenética y brutal en el infierno.",
    desarrollador: "id Software",
    tienda: "Steam",
    completado: true,
    horasJugadas: 25,
  },
  {
    nombre: "Stardew Valley",
    año: 2016,
    genero: "Simulación",
    plataforma: "PC, Switch, PS4, Xbox One, Móvil",
    imagen:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg",
    resena: "Crea la granja de tus sueños y haz amigos en el pueblo.",
    desarrollador: "ConcernedApe",
    tienda: "Steam",
    completado: false,
    horasJugadas: 80,
  },
  {
    nombre: "Celeste",
    año: 2018,
    genero: "Plataformas",
    plataforma: "PC, Switch, PS4, Xbox One",
    imagen:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/header.jpg",
    resena: "Supera desafíos y ayuda a Madeline a escalar la montaña Celeste.",
    desarrollador: "Matt Makes Games",
    tienda: "Steam",
    completado: true,
    horasJugadas: 30,
  },
];

const juegosEjemplo = [];
for (let i = 0; i < 50; i++) {
  const base = juegosBase[i % juegosBase.length];
  juegosEjemplo.push({
    nombre: base.nombre + (i >= juegosBase.length ? ` #${i + 1}` : ""),
    año: parseInt(base.año) + (i % 5),
    genero: generosValidos[i % generosValidos.length],
    plataforma: base.plataforma,
    imagen: base.imagen,
    resena: base.resena,
    desarrollador: base.desarrollador,
    tienda: base.tienda,
    completado: i % 2 === 0,
    horasJugadas: 10 + ((i * 3) % 120),
  });
}

async function borrarTodo() {
  // Borrar reseñas
  const resenias = await fetch(`${API_URL}/resenias`).then((r) => r.json());
  for (const r of resenias) {
    await fetch(`${API_URL}/resenias/${r.id || r._id}`, { method: "DELETE" });
  }
  // Borrar juegos
  const juegos = await fetch(`${API_URL}/juegos`).then((r) => r.json());
  for (const j of juegos) {
    await fetch(`${API_URL}/juegos/${j.id || j._id}`, { method: "DELETE" });
  }
}

async function crearJuegos() {
  for (const juego of juegosEjemplo) {
    // Asegurarse de enviar los campos correctos y tipos válidos
    const payload = {
      nombre: String(juego.nombre),
      año: parseInt(juego.año),
      genero: String(juego.genero),
      plataforma: String(juego.plataforma),
      imagen: String(juego.imagen),
      resena: String(juego.resena),
      desarrollador: String(juego.desarrollador),
      tienda: String(juego.tienda),
      completado: Boolean(juego.completado),
      horasJugadas: Number(juego.horasJugadas),
    };
    console.log("\nEnviando juego:", JSON.stringify(payload, null, 2));
    const res = await fetch(`${API_URL}/juegos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const respuestaTexto = await res.text();
    if (!res.ok) {
      console.error(`Error creando juego: ${payload.nombre}`);
      console.error("Respuesta del backend:", respuestaTexto);
    } else {
      console.log(`Juego creado: ${payload.nombre}`);
      console.log("Respuesta del backend:", respuestaTexto);
    }
  }
}

(async () => {
  console.log("Borrando todos los juegos y reseñas...");
  await borrarTodo();
  console.log("Creando 50 juegos de ejemplo...");
  await crearJuegos();
  console.log("¡Listo!");
})();
