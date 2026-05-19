const calcularPromedio = require("../app");

test("calcula promedio ponderado correctamente", () => {
  // 60*0.1 + 70*0.2 + 75*0.3 + 80*0.4 = 6+14+22.5+32 = 74.5
  expect(calcularPromedio(60, 70, 75, 80)).toBe(74.5);
});

test("calcula con notas iguales", () => {
  expect(calcularPromedio(50, 50, 50, 50)).toBe(50);
});

test("lanza error si falta una nota", () => {
  expect(() => calcularPromedio(60, 70, 75)).toThrow(
    "Todas las notas son requeridas",
  );
});

test("lanza error si nota fuera de rango", () => {
  expect(() => calcularPromedio(60, 70, 75, 101)).toThrow(
    "Las notas deben estar entre 1 y 100",
  );
});

test("lanza error si nota es menor a 1", () => {
  expect(() => calcularPromedio(0, 70, 75, 80)).toThrow(
    "Las notas deben estar entre 1 y 100",
  );
});
