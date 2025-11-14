# Imagen súper liviana de NGINX
FROM nginx:alpine

# Copiar todos los archivos HTML, CSS, JS al servidor web
COPY . /usr/share/nginx/html

# Exponer el puerto 80 (Render usa este puerto)
EXPOSE 80

# Iniciar NGINX
CMD ["nginx", "-g", "daemon off;"]
