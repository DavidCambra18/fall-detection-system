// Esto será mientras usamos ng serve, para desarrollo local
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api' // Apuntamos directo al Backend con CORS
};

// Esto será cuando hagamos el build final
/*
export const environment = {
  production: true,
  apiUrl: 'http://tu-dominio-produccion.com/api' 
};
*/