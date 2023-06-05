function loadImage() {
    const fileInput = document.getElementById('fileInput');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();

    image.onload = function() {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      vectorizeImage();
    };

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Función para vectorizar la imagen y crear la matriz de puntos
  function vectorizeImage() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    const matrix = [];

    for (let y = 0; y < canvas.height; y++) {
      const row = [];

      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        const r = imageData[index];
        const g = imageData[index + 1];
        const b = imageData[index + 2];
        const isBlack = r === 0 && g === 0 && b === 0;

        row.push(isBlack ? 0 : 255);
      }

      matrix.push(row);
    }

    console.log(matrix); // Imprimir la matriz de puntos en la consola
  }