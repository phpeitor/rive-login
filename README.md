# Rive Login Demo

[![forthebadge](http://forthebadge.com/images/badges/made-with-typescript.svg)](https://www.linkedin.com/in/drphp/)
[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](https://www.linkedin.com/in/drphp/)

Demo de login animado con Rive en React y Vite. El personaje responde a foco, escritura y resultado del formulario (success o error).

[![Video](https://img.youtube.com/vi/DhTUdLmyLqs/0.jpg)](https://www.youtube.com/watch?v=DhTUdLmyLqs)

[Ver demo en YouTube](https://www.youtube.com/watch?v=DhTUdLmyLqs)

## Stack

- React 19
- Vite 7
- rive-react
- CSS

## Requisitos

- Node.js 18+
- npm

## Instalacion

```bash
npm install
```

## Scripts disponibles

```bash
npm run dev      # desarrollo
npm run build    # build de produccion
npm run preview  # previsualizar build
npm run lint     # revisar estilo/codigo
```

## Flujo de login simulado

El componente carga credenciales desde:

- public/mock-login.json

Regla actual del formulario:

- Si usuario y password coinciden con success, dispara animacion de exito.
- Cualquier otra combinacion dispara animacion de error.

## Credenciales de prueba

Archivo actual:

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

Pruebas rapidas:

1. Success: usuario demo, password teddy.
2. Error: cualquier password distinta de teddy (por ejemplo error).

## Estructura relevante

```text
public/
	login-teddy.riv
	mock-login.json
src/
	login-form/
		LoginFormComponent.tsx
		LoginFormComponent.css
```

## Notas

- Si no carga mock-login.json, el componente usa credenciales por defecto internas.
- El archivo .riv debe conservar el state machine Login Machine con entradas esperadas (isChecking, numLook, trigSuccess, trigFail, isHandsUp).