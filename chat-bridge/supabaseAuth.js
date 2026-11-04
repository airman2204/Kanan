const { BufferJSON, initAuthCreds } = require('@whiskeysockets/baileys');

/**
 * Adaptador de estado de autenticación de Baileys respaldado por Supabase (PostgreSQL).
 * Permite que las credenciales de WhatsApp sobrevivan a reinicios, despliegues
 * y suspensiones de contenedores en la nube sin volver a pedir QR jamás.
 */
async function useSupabaseAuthState(supabase, sessionId = 'kanan_primary_session') {
  const table = 'whatsapp_sessions';

  const writeData = async (data, key) => {
    try {
      const jsonString = JSON.stringify(data, BufferJSON.replacer);
      const jsonValue = JSON.parse(jsonString);

      const { error } = await supabase
        .from(table)
        .upsert(
          {
            session_id: sessionId,
            key: key,
            value: jsonValue,
          },
          { onConflict: 'session_id,key' }
        );

      if (error) {
        console.warn(`[Supabase Auth] Error guardando clave "${key}":`, error.message);
      }
    } catch (err) {
      console.warn(`[Supabase Auth] Fallo al serializar clave "${key}":`, err.message);
    }
  };

  const readData = async (key) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('value')
        .eq('session_id', sessionId)
        .eq('key', key)
        .single();

      if (error || !data || !data.value) {
        return null;
      }

      return JSON.parse(JSON.stringify(data.value), BufferJSON.reviver);
    } catch {
      return null;
    }
  };

  const removeData = async (key) => {
    try {
      await supabase
        .from(table)
        .delete()
        .eq('session_id', sessionId)
        .eq('key', key);
    } catch (err) {
      console.warn(`[Supabase Auth] Error eliminando clave "${key}":`, err.message);
    }
  };

  // Cargar credenciales guardadas en Supabase o inicializar nuevas
  const creds = (await readData('creds')) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === 'app-state-sync-key' && value) {
                value = BufferJSON.reviver(type, value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data) => {
          await Promise.all(
            Object.keys(data).map(async (category) => {
              for (const id of Object.keys(data[category])) {
                const value = data[category][id];
                const key = `${category}-${id}`;
                if (value) {
                  await writeData(value, key);
                } else {
                  await removeData(key);
                }
              }
            })
          );
        },
      },
    },
    saveCreds: async () => {
      await writeData(creds, 'creds');
    },
  };
}

module.exports = { useSupabaseAuthState };
