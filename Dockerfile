# Usa una imagen ligera de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto (opcional para esta app de consola, pero buena práctica)
EXPOSE 3000

# Comando para ejecutar la aplicación (aunque tu app es una función exportada, esto mantiene el contenedor vivo si decides añadir un servidor)
CMD ["node", "app.js"]