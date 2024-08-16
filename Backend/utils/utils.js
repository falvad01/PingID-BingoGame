const sharp = require('sharp');


/*
 * Transforma date to ecpoch format
 * @param {*} thedate
 * @returns
 */
function dateToEpoch(thedate) {
  var time = thedate.getTime();
  return time - (time % 86400000);
}

/**
 *
 * @param src
 * @param newX
 * @param newY
 * @returns
 */
function compressImage(base64ImageWithPrefix, newX, newY) {
  console.log("Resizing image");

  return new Promise((resolve, reject) => {
    // Eliminar el prefijo de la cadena base64
    const base64Image = base64ImageWithPrefix.split(',')[1];
    const buffer = Buffer.from(base64Image, 'base64');

    sharp(buffer)
      .resize(newX, newY)
      .toBuffer()
      .then((data) => {
        // Reconstruir la cadena base64 con el prefijo MIME
        const resizedBase64 = `data:image/jpeg;base64,${data.toString('base64')}`;
        resolve(resizedBase64);
      })
      .catch((error) => reject(error));
  });
}

function isBase64Image(base64) {
  // Remover el prefijo data: si existe
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  
  // Decodificar la cadena base64 en un buffer
  const buffer = Buffer.from(base64Data, 'base64');
  
  // Leer los primeros bytes (magic number) para identificar el tipo de archivo
  const magicNumber = buffer.toString('hex', 0, 4).toUpperCase();
  
  // Comparar el magic number con tipos de imágenes conocidos
  const imageHeaders = {
    JPEG: 'FFD8FF',
    PNG: '89504E47',
    GIF: '47494638',
    BMP: '424D'
  };

  return Object.values(imageHeaders).some(header => magicNumber.startsWith(header));
}



module.exports = { dateToEpoch, compressImage, isBase64Image };
