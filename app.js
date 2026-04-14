function calcularPromedio(nota1, nota2, nota3, nota4) {
  const notas = [nota1, nota2, nota3, nota4];

  for (const nota of notas) {
    if (nota === undefined || nota === null) {
      throw new Error("Todas las notas son requeridas");
    }
    if (typeof nota !== "number" || nota < 1 || nota > 100) {
      throw new Error("Las notas deben estar entre 1 y 100");
    }
  }

  const promedio =
    nota1 * 0.1 + nota2 * 0.2 + nota3 * 0.3 + nota4 * 0.4;

  return Math.round(promedio * 10) / 10;
}

module.exports = calcularPromedio;