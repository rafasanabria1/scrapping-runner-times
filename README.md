# Scrap runner times

## Descripción

Este repositorio contiene una aplicación que permite leer el contenido de la web [https://www.ideain.com/](https://www.ideain.com/) para obtener la información y resultados de las carreras publicadas y mostrarla en una interfaz visualmente más atractiva y moderna mediante el proyecto [Runner Times](https://github.com/rafasanabria1/runner-times). Ambos proyectos se han realizado solamente con el objetivo de aprendizaje sobre los lenguajes y las platarformas utilizadas. Las imágenes que se utilizan a modo de cartel de cada una de las carreras, son descargas y resubidas a [Cloudinary](https://cloudinary.com/).

## Sitio público

Puedes ver el resultado del proyecto Runner Times desplegado en [https://runner-times.vercel.app/](https://runner-times.vercel.app/), ya que este proyecto es simplemente un script ejecutable. Si estás interesado en ejecutar el script de manera local, puedes hacerlo siguiendo las instrucciones que encontrarás más abajo.

## Tecnologías utilizadas

- [Playwright](https://playwright.dev/)
- [JavaScript](https://www.javascript.com/)

## Tareas en desarrollo
- Implementar lectura desde otros sitios web de resultados.
- Migrar el proyecto a TypeScript.
  

## Instalación

1. Clona este repositorio:
   `git clone https://github.com/rafasanabria1/scrapping-runner-times`

2. Navega a la carpeta del proyecto:
   `cd scrapping-runner-times`

3. Configura las variables de entorno necesarias editando el archivo `.env` (será necesario una cuenta en [Cloudinary](https://cloudinary.com/)):
    ```
      API_URL=your-api-url-to-store-data
      CLOUDINARY_CLOUD_NAME=you-cloudinary-user
      CLOUDINARY_API_KEY=your-cloudinary-api-key
      CLOUDINARY_API_SECRET=your-cloudinary-api-secret
    ```

    La variable API_URL será la URL de la API que del proyecto [Runner Times](https://github.com/rafasanabria1/runner-times).

4. Instala las dependencias:
   `npm install`

5. Ejecuta el script:
   `npm run scrap`
