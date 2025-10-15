module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // Nueva funcionalidad
        "fix", // Corrección de bug
        "docs", // Cambios en documentación
        "style", // Cambios de formato (no afectan el código)
        "refactor", // Refactorización
        "perf", // Mejoras de rendimiento
        "test", // Agregar o corregir tests
        "chore", // Tareas de mantenimiento
        "revert", // Revertir cambios
        "build", // Cambios en el sistema de build
        "ci", // Cambios en CI/CD
      ],
    ],
  },
};
