# Rive Login Demo

Demo de login animado con Rive, React y Vite.
El personaje responde al foco de los inputs, a la escritura y al resultado del inicio de sesion.

[Ver demo en YouTube](https://www.youtube.com/watch?v=DhTUdLmyLqs)

## Que incluye

- Integracion de un archivo Rive con state machine.
- Login simulado con credenciales definidas en JSON.
- Feedback visual y de estado (success o fail).
- Panel de pruebas para cargar escenarios y disparar animaciones manualmente.

## Stack

- React 19
- Vite 7
- rive-react
- sonner
- CSS

## Requisitos

- Node.js 20 o superior (recomendado para el ecosistema actual de Vite).
- npm

## Inicio rapido

1. Instalar dependencias.

```bash
npm install
```

2. Levantar entorno de desarrollo.

```bash
npm run dev
```

3. Abrir en navegador.

```text
http://localhost:5173
```

## Scripts

- npm run dev: servidor de desarrollo.
- npm run build: build de produccion.
- npm run preview: previsualiza el build local.
- npm run lint: revisa reglas de lint.

## Credenciales y flujo de login

El componente intenta leer credenciales desde public/mock-login.json.

Valores esperados por defecto:

```json
{
  "success": {
    "usuario": "demo",
    "password": "teddy"
  },
  "error": {
    "usuario": "demo",
    "password": "error"
  }
}
```

Reglas de validacion:

- Si coincide con success, dispara animacion de exito.
- Si no coincide, dispara animacion de error.
- Si el JSON no existe o falla, se usan credenciales internas por defecto.

## Panel de pruebas

Desde la UI puedes:

- Cargar escenario success.
- Cargar escenario error.
- Ejecutar animaciones del personaje: mirar input, manos arriba, manos abajo, success, fail y reset.

## Estructura principal

```text
public/
  login-teddy.riv
  mock-login.json
src/
  login-form/
    LoginFormComponent.tsx
    LoginFormComponent.css
```

## Troubleshooting

- Si ves imports CSS en rojo en TypeScript, verifica que exista src/types/style-imports.d.ts con la declaracion de modulo para .css.
- Si aparece un aviso de baseline-browser-mapping en terminal, puedes actualizarlo con npm i baseline-browser-mapping@latest -D.
- Si cambias package-lock.json y Vite recompila dependencias, ese comportamiento es normal.

## Licencia

Proyecto de demostracion para aprendizaje e integracion con Rive.