import fs from "fs/promises";
import pg from "pg";
import { createClerkClient } from "@clerk/backend";

const { Pool } = pg;

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  const clerkSecret = process.env.CLERK_SECRET_KEY;

  if (!dbUrl) throw new Error("Falta DATABASE_URL en .env.local");
  if (!clerkSecret) throw new Error("Falta CLERK_SECRET_KEY en .env.local");

  console.log("Conectando a la base de datos...");
  const pool = new Pool({ connectionString: dbUrl });

  let tenantId;
  try {
    const res = await pool.query("SELECT id FROM tenants WHERE slug = 'colegio-san-luis'");
    if (res.rows.length === 0) {
      throw new Error("No se encontró el tenant 'colegio-san-luis' en la BD.");
    }
    tenantId = res.rows[0].id;
    console.log(`Tenant UUID encontrado: ${tenantId}`);
  } finally {
    await pool.end();
  }

  const clerk = createClerkClient({ secretKey: clerkSecret });

  console.log("Leyendo archivo organizadores-ceal.csv...");
  const content = await fs.readFile("organizadores-ceal.csv", "utf-8");
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  
  // Asumimos que la primera línea son las cabeceras
  const headers = lines[0].split(",");
  
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length < 5) continue;
    
    const [firstName, lastName, email, password, rol] = parts;

    try {
      // 1. Buscar si existe
      const { data: users } = await clerk.users.getUserList({
        emailAddress: [email],
      });

      if (users.length > 0) {
        const user = users[0];
        console.log(`Usuario existente: ${email}. Actualizando metadata...`);
        await clerk.users.updateUserMetadata(user.id, {
          publicMetadata: {
            rol: "organizador",
            tenant_id: tenantId,
          }
        });
        console.log(`✅ Actualizado: ${email}`);
      } else {
        console.log(`Creando nuevo usuario: ${email}...`);
        
        // 2. Crear usuario
        const newUser = await clerk.users.createUser({
          emailAddress: [email],
          password,
          firstName,
          lastName,
          skipPasswordChecks: true,
          publicMetadata: {
            rol: "organizador",
            tenant_id: tenantId,
          }
        });
        
        // 3. Marcar email como verificado (Clerk requiere actualizar el objeto EmailAddress para esto)
        // Buscamos el ID del email primario
        const emailObj = newUser.emailAddresses.find(e => e.emailAddress === email);
        if (emailObj) {
          // En la v1 de clerk/backend no hay un método directo para verificar el email en la creación,
          // pero al ser admin created con password a veces es suficiente.
          // Intentaremos actualizar el email address a verificado si es posible usando fetch
          await fetch(`https://api.clerk.com/v1/email_addresses/${emailObj.id}`, {
            method: "PATCH",
            headers: {
              "Authorization": `Bearer ${clerkSecret}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ verified: true })
          });
        }
        
        console.log(`✅ Creado: ${email}`);
      }
    } catch (error) {
      console.error(`❌ Error con ${email}:`, error?.errors ? JSON.stringify(error.errors) : error.message);
    }
  }

  console.log("Proceso terminado.");
}

main().catch(console.error);
