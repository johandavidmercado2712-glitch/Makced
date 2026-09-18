import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer .env.local manualmente
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const [key, ...rest] = trimmed.split("=");
  env[key.trim()] = rest.join("=").trim();
}

const URL = env.NEXT_PUBLIC_INSFORGE_URL;
const KEY = env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!URL || !KEY) {
  console.error("Faltan variables de entorno NEXT_PUBLIC_INSFORGE_URL y NEXT_PUBLIC_INSFORGE_ANON_KEY");
  process.exit(1);
}

const headers = {
  "apikey": KEY,
  "Authorization": `Bearer ${KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
};

async function query(table, method = "GET", body = null) {
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${URL}/rest/v1/${table}`, opts);
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error en ${table}:`, res.status, data);
    return null;
  }
  return data;
}

async function seed() {
  console.log("Iniciando seed...");
  console.log("URL:", URL);

  // 1. Crear tienda MAKCED
  console.log("\n1. Creando tienda...");
  const tiendaRes = await query("tiendas", "POST", {
    nombre_tienda: "MAKCED",
    subdominio: "makced",
    plan_actual: "enterprise",
    color_principal: "#4CE1AC",
    descripcion: "Tu tienda de calzado y ropa deportiva favorita",
    activa: true,
  });

  if (!tiendaRes || !tiendaRes[0]) {
    console.error("No se pudo crear la tienda");
    process.exit(1);
  }

  const tienda = tiendaRes[0];
  console.log("Tienda creada:", tienda.nombre_tienda, tienda.id);

  // 2. Crear marcas
  console.log("\n2. Creando marcas...");
  const marcasRes = await query("marcas", "POST", [
    { tienda_id: tienda.id, nombre: "Nike", logo_url: "/marca-1.jpg", activa: true },
    { tienda_id: tienda.id, nombre: "Adidas", logo_url: "/marca-2.jpg", activa: true },
    { tienda_id: tienda.id, nombre: "Puma", logo_url: "/marca-3.jpg", activa: true },
    { tienda_id: tienda.id, nombre: "Reebok", logo_url: "/marca-4.jpg", activa: true },
    { tienda_id: tienda.id, nombre: "New Balance", logo_url: "/marca-5.jpg", activa: true },
    { tienda_id: tienda.id, nombre: "Under Armour", logo_url: "/marca-6.jpg", activa: true },
  ]);

  if (!marcasRes) {
    console.error("No se pudieron crear las marcas");
    process.exit(1);
  }
  console.log("Marcas creadas:", marcasRes.length);

  // 3. Crear categorías
  console.log("\n3. Creando categorías...");
  const categoriasRes = await query("categorias", "POST", [
    { tienda_id: tienda.id, nombre: "Hombre", slug: "hombre", imagen_url: "/hombre.jpg", activa: true },
    { tienda_id: tienda.id, nombre: "Mujer", slug: "mujer", imagen_url: "/mujer.jpg", activa: true },
    { tienda_id: tienda.id, nombre: "Deportivo", slug: "deportivo", imagen_url: "/deportivo.jpg", activa: true },
  ]);

  if (!categoriasRes) {
    console.error("No se pudieron crear las categorías");
    process.exit(1);
  }
  console.log("Categorías creadas:", categoriasRes.length);

  // 4. Crear productos
  console.log("\n4. Creando productos...");
  const nikeId = marcasRes.find(m => m.nombre === "Nike")?.id;
  const adidasId = marcasRes.find(m => m.nombre === "Adidas")?.id;
  const pumaId = marcasRes.find(m => m.nombre === "Puma")?.id;
  const reebokId = marcasRes.find(m => m.nombre === "Reebok")?.id;
  const nbId = marcasRes.find(m => m.nombre === "New Balance")?.id;
  const uaId = marcasRes.find(m => m.nombre === "Under Armour")?.id;

  const productos = [
    // Nike (3)
    {
      tienda_id: tienda.id,
      nombre: "Zapatillas Nike Air Max 270",
      descripcion: "Las Air Max 270 combinan un diseño moderno con la unidad Air más grande hasta la fecha para un comfort excepcional.",
      precio: 120000,
      stock: 50,
      imagen_url: "/producto.jpg",
      slug: "zapatillas-nike-air-max-270",
      es_destacado: true,
      es_nuevo: true,
      estado: true,
    },
    {
      tienda_id: tienda.id,
      nombre: "Nike Running Revolution 7",
      descripcion: "Zapatillas de running para entrenamiento diario con amortiguación React.",
      precio: 95000,
      stock: 35,
      imagen_url: "/producto.jpg",
      slug: "nike-running-revolution-7",
      es_destacado: true,
      es_nuevo: false,
      estado: true,
    },
    {
      tienda_id: tienda.id,
      nombre: "Nike Training Metcon 9",
      descripcion: "Diseñadas para entrenamiento de alta intensidad y levantamiento de pesas.",
      precio: 145000,
      stock: 25,
      imagen_url: "/producto.jpg",
      slug: "nike-training-metcon-9",
      es_destacado: false,
      es_nuevo: true,
      estado: true,
    },
    // Adidas (3)
    {
      tienda_id: tienda.id,
      nombre: "Adidas Ultraboost Light",
      descripcion: "La zapatilla de running más responsiva de adidas con tecnología BOOST.",
      precio: 180000,
      stock: 40,
      imagen_url: "/producto.jpg",
      slug: "adidas-ultraboost-light",
      es_destacado: true,
      es_nuevo: true,
      estado: true,
    },
    {
      tienda_id: tienda.id,
      nombre: "Adidas Gazelle Bold",
      descripcion: "Icono del estilo casual con suela chunky y cuero premium.",
      precio: 110000,
      stock: 60,
      imagen_url: "/producto.jpg",
      slug: "adidas-gazelle-bold",
      es_destacado: false,
      es_nuevo: false,
      estado: true,
    },
    {
      tienda_id: tienda.id,
      nombre: "Adidas Samba OG",
      descripcion: "Originarias del fútbol, ahora icono del estilo casual.",
      precio: 95000,
      stock: 65,
      imagen_url: "/producto.jpg",
      slug: "adidas-samba-og",
      es_destacado: true,
      es_nuevo: false,
      estado: true,
    },
    // Puma (2)
    {
      tienda_id: tienda.id,
      nombre: "Puma RS-X Reinvention",
      descripcion: "Diseño retro-futurista con amortiguación RS para estilo urbano.",
      precio: 85000,
      stock: 45,
      imagen_url: "/producto.jpg",
      slug: "puma-rsx-reinvention",
      es_destacado: true,
      es_nuevo: false,
      estado: true,
    },
    {
      tienda_id: tienda.id,
      nombre: "Puma Velocity Nitro 2",
      descripcion: "Zapatillas de running con espuma NITRO para máxima respuesta.",
      precio: 130000,
      stock: 30,
      imagen_url: "/producto.jpg",
      slug: "puma-velocity-nitro-2",
      es_destacado: false,
      es_nuevo: true,
      estado: true,
    },
    // Reebok (1)
    {
      tienda_id: tienda.id,
      nombre: "Reebok Classic Leather",
      descripcion: "El clásico atemporal con cuero premium y diseño limpio.",
      precio: 75000,
      stock: 55,
      imagen_url: "/producto.jpg",
      slug: "reebok-classic-leather",
      es_destacado: false,
      es_nuevo: false,
      estado: true,
    },
    // New Balance (2)
    {
      tienda_id: tienda.id,
      nombre: "New Balance 574 Classic",
      descripcion: "El modelo más icónico de New Balance con tecnología ENCAP.",
      precio: 110000,
      stock: 40,
      imagen_url: "/producto.jpg",
      slug: "new-balance-574-classic",
      es_destacado: true,
      es_nuevo: false,
      estado: true,
    },
    {
      tienda_id: tienda.id,
      nombre: "New Balance Fresh Foam X 1080v13",
      descripcion: "Zapatilla premium de running con espuma Fresh Foam ultrablanda.",
      precio: 165000,
      stock: 20,
      imagen_url: "/producto.jpg",
      slug: "new-balance-fresh-foam-1080v13",
      es_destacado: false,
      es_nuevo: true,
      estado: true,
    },
    // Under Armour (2)
    {
      tienda_id: tienda.id,
      nombre: "Under Armour HOVR Phantom 3",
      descripcion: "Zapatillas de running con tecnología UA HOVR que elimina el impacto.",
      precio: 135000,
      stock: 35,
      imagen_url: "/producto.jpg",
      slug: "under-armour-hovr-phantom-3",
      es_destacado: true,
      es_nuevo: true,
      estado: true,
    },
    {
      tienda_id: tienda.id,
      nombre: "Under Armour Curry 11",
      descripcion: "Baloncesto de alto rendimiento con amortiguación UA Flow.",
      precio: 155000,
      stock: 15,
      imagen_url: "/producto.jpg",
      slug: "under-armour-curry-11",
      es_destacado: false,
      es_nuevo: true,
      estado: true,
    },
    // Nike extra (1)
    {
      tienda_id: tienda.id,
      nombre: "Nike Air Jordan 1 Retro High",
      descripcion: "El ícono del streetwear. Diseño clásico con cuero auténtico.",
      precio: 220000,
      stock: 10,
      imagen_url: "/producto.jpg",
      slug: "nike-air-jordan-1-retro-high",
      es_destacado: true,
      es_nuevo: false,
      estado: true,
    },
    // Puma extra (1)
    {
      tienda_id: tienda.id,
      nombre: "Puma Suede Classic XXI",
      descripcion: "El clásico de Puma desde 1968, cuero anteiro premium.",
      precio: 70000,
      stock: 50,
      imagen_url: "/producto.jpg",
      slug: "puma-suede-classic-xxi",
      es_destacado: false,
      es_nuevo: false,
      estado: true,
    },
  ];

  const productosRes = await query("productos", "POST", productos);

  if (!productosRes) {
    console.error("No se pudieron crear los productos");
    process.exit(1);
  }
  console.log("Productos creados:", productosRes.length);

  console.log("\n=== Seed completado ===");
  console.log(`Tienda: ${tienda.nombre_tienda} (${tienda.id})`);
  console.log(`Marcas: ${marcasRes.length}`);
  console.log(`Categorías: ${categoriasRes.length}`);
  console.log(`Productos: ${productosRes.length}`);
}

seed().catch(console.error);
