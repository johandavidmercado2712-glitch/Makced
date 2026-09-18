import { createClient } from "@insforge/sdk";

const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});

async function seed() {
  console.log("Iniciando seed...");

  // 1. Crear tienda MAKCED
  console.log("Creando tienda...");
  const { data: tienda, error: tiendaError } = await insforge.database
    .from("tiendas")
    .insert([{
      nombre_tienda: "MAKCED",
      propietario: "Jason Tood",
      subdominio: "makced",
      plan_actual: "enterprise",
      color_principal: "#4CE1AC",
      descripcion: "Tu tienda de calzado y ropa deportiva favorita",
      activa: true
    }])
    .select()
    .single();

  if (tiendaError) {
    console.error("Error creando tienda:", tiendaError);
    return;
  }
  console.log("Tienda creada:", tienda.id);

  // 2. Crear marcas
  console.log("Creando marcas...");
  const marcas = [
    { tienda_id: tienda.id, nombre: "Nike", logo_url: "/marca-1.jpg", activa: true },
    { tienda_id: tienda.id, nombre: "Adidas", logo_url: "/marca-2.jpg", activa: true },
    { tienda_id: tienda.id, nombre: "Puma", logo_url: "/marca-3.jpg", activa: true },
    { tienda_id: tienda.id, nombre: "Reebok", logo_url: "/marca-4.jpg", activa: true },
    { tienda_id: tienda.id, nombre: "New Balance", logo_url: "/marca-5.jpg", activa: true },
    { tienda_id: tienda.id, nombre: "Under Armour", logo_url: "/marca-6.jpg", activa: true },
  ];

  const { data: marcasCreadas, error: marcasError } = await insforge.database
    .from("marcas")
    .insert(marcas)
    .select();

  if (marcasError) {
    console.error("Error creando marcas:", marcasError);
    return;
  }
  console.log("Marcas creadas:", marcasCreadas?.length);

  // 3. Crear categorías
  console.log("Creando categorías...");
  const categorias = [
    { tienda_id: tienda.id, nombre: "Hombre", slug: "hombre", imagen_url: "/hombre.jpg", activa: true },
    { tienda_id: tienda.id, nombre: "Mujer", slug: "mujer", imagen_url: "/mujer.jpg", activa: true },
    { tienda_id: tienda.id, nombre: "Deportivo", slug: "deportivo", imagen_url: "/deportivo.jpg", activa: true },
  ];

  const { data: categoriasCreadas, error: categoriasError } = await insforge.database
    .from("categorias")
    .insert(categorias)
    .select();

  if (categoriasError) {
    console.error("Error creando categorías:", categoriasError);
    return;
  }
  console.log("Categorías creadas:", categoriasCreadas?.length);

  // 4. Crear productos
  console.log("Creando productos...");
  const nikeId = marcasCreadas?.find(m => m.nombre === "Nike")?.id;
  const adidasId = marcasCreadas?.find(m => m.nombre === "Adidas")?.id;
  const pumaId = marcasCreadas?.find(m => m.nombre === "Puma")?.id;
  const reebokId = marcasCreadas?.find(m => m.nombre === "Reebok")?.id;
  const nbId = marcasCreadas?.find(m => m.nombre === "New Balance")?.id;
  const uaId = marcasCreadas?.find(m => m.nombre === "Under Armour")?.id;

  const hombreId = categoriasCreadas?.find(c => c.slug === "hombre")?.id;
  const mujerId = categoriasCreadas?.find(c => c.slug === "mujer")?.id;
  const deportivoId = categoriasCreadas?.find(c => c.slug === "deportivo")?.id;

  const productos = [
    // Nike
    {
      tienda_id: tienda.id,
      nombre: "Zapatillas Nike Air Max 270",
      descripcion: "Las Air Max 270 combinan un diseño moderno con la unidad Air más grande hasta la fecha para un confort exception.",
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
    // Adidas
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
    // Puma
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
    // Reebok
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
    // New Balance
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
    // Under Armour
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
    // Más productos variados
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
    {
      tienda_id: tienda.id,
      nombre: "Puma Suede Classic XXI",
      descripcion: "El clásico de Puma desde 1968, anteiro premium.",
      precio: 70000,
      stock: 50,
      imagen_url: "/producto.jpg",
      slug: "puma-suede-classic-xxi",
      es_destacado: false,
      es_nuevo: false,
      estado: true,
    },
  ];

  const { data: productosCreados, error: productosError } = await insforge.database
    .from("productos")
    .insert(productos)
    .select();

  if (productosError) {
    console.error("Error creando productos:", productosError);
    return;
  }
  console.log("Productos creados:", productosCreados?.length);

  // 5. Asignar categorías a productos (usando producto_categoria si existe, o directamente)
  // Como no hay tabla intermedia, asignaremos categorías a través de una query directa
  // Por ahora, los productos no tienen categoría directa en la tabla
  // Necesitamos agregar la relación producto-categoría

  console.log("\n=== Seed completado ===");
  console.log(`Tienda: ${tienda.nombre_tienda} (${tienda.id})`);
  console.log(`Marcas: ${marcasCreadas?.length}`);
  console.log(`Categorías: ${categoriasCreadas?.length}`);
  console.log(`Productos: ${productosCreados?.length}`);
}

seed().catch(console.error);
