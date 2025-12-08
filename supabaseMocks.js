// supabaseMock.js
export const supabase = {
  from: () => ({
    select: () => ({ data: [{ id_usuario: 1, nombre: "Rocío", email: "rocio@test.com", rol: "empleado" }], error: null }),
    insert: () => ({ data: [{ id_usuario: 2 }], error: null }),
    update: () => ({ data: [{ id_usuario: 1 }], error: null }),
    delete: () => ({ error: null })
  })
};
