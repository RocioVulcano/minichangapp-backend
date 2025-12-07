# Imagen super liviana de NGINX
FROM nginx:alpine

# Copia todos los archivos HTML, CSS, JS al servidor web
COPY . /usr/share/nginx/html

# Expone el puerto 80 (Render usa este puerto)
EXPOSE 80

# Iniciar NGINX
CMD ["nginx", "-g", "daemon off;"]
