export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Manejo de CORS (Permitir peticiones desde cualquier dominio)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // 2. Solo aceptar POST en la ruta /api/solicitudes
    if (request.method !== "POST" || !url.pathname.endsWith("/api/solicitudes")) {
      return new Response("Not found", { status: 404 });
    }

    try {
      // 3. Obtener los datos del FormData (texto + archivos)
      const formData = await request.formData();
      const rawData = formData.get("data");
      
      if (!rawData) {
        return new Response(JSON.stringify({ error: "Missing data payload" }), { 
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }
        });
      }

      // 4. Parsear el JSON y añadir metadatos
      let data = JSON.parse(rawData);
      data.id = Date.now().toString();
      data.fechaCreacion = new Date().toISOString();

      // 5. Procesar archivo adjunto si existe (Subir a R2)
      const file = formData.get("archivoAdjunto");
      if (file && file instanceof File) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = `adjunto-${uniqueSuffix}-${file.name}`;
        
        // Guardar archivo en el Bucket R2
        await env.UPLOADS_BUCKET.put(fileName, file.stream(), {
          httpMetadata: { contentType: file.type }
        });

        // Registrar la referencia en los datos del formulario
        data.archivoAdjunto = {
          nombreOriginal: file.name,
          r2Key: fileName,
          tamaño: file.size,
          mimetype: file.type
        };
      }

      // 6. Guardar los datos completos del formulario en KV
      // La "Key" será el ID único de la solicitud
      await env.SOLICITUDES_KV.put(data.id, JSON.stringify(data));

      // 7. Responder éxito al frontend
      return new Response(JSON.stringify({ message: "Solicitud guardada correctamente", id: data.id }), {
        status: 201,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      });

    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: "Error interno del servidor Worker" }), {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      });
    }
  },
};
