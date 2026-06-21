# ADR-001: Estrategia de autenticación mediante JWT y tokens de actualización

## Estado

Aceptado

## Fecha

20 de junio de 2026

## Contexto

La aplicación «Habit Tracker» requiere autenticación para dos tipos de usuarios:

* Paciente
* Nutricionista

La aplicación se implementará como una aplicación web pública y debe permitir una autenticación segura en múltiples dispositivos y sesiones de navegador.

La solución de autenticación debe:

* Ser sin estado para las solicitudes de API.
* Permitir la renovación de la sesión sin obligar a los usuarios a iniciar sesión repetidamente.
* Escalar sin requerir almacenamiento de sesiones del lado del servidor.
* Funcionar bien con un frontend de React y un backend de Fastify.

Alternativas consideradas:

1. Sesiones del lado del servidor
2. Solo JWT
3. JWT + tokens de actualización

---

## Decisión

La aplicación utilizará:

* Tokens de acceso JWT de corta duración
* Tokens de actualización de larga duración

Tokens de acceso:

* Válidos durante 15 minutos
* Se incluyen en las solicitudes de API autenticadas

Tokens de actualización:

* Válidos durante 7 días
* Se utilizan únicamente para obtener nuevos tokens de acceso
* Se almacenan con hash en la base de datos

---

## Justificación

JWT proporciona un mecanismo de autenticación sin estado adecuado para las API REST.

El uso exclusivo de JWT obligaría a los usuarios a iniciar sesión con frecuencia tras la caducidad del token.

La incorporación de tokens de actualización permite:

* Una mejor experiencia de usuario
* Tokens de acceso de corta duración
* Un impacto reducido en caso de que un token de acceso se vea comprometido

Los tokens de actualización se almacenarán con hash en la base de datos para reducir los riesgos de seguridad en caso de que la base de datos quede expuesta.

---

## Consecuencias

### Positivas
* Autenticación de API sin estado
* Mejor experiencia de usuario
* Mayor seguridad gracias a los tokens de acceso de corta duración
* Admite escalabilidad futura

### Desventajas

* Mayor complejidad de implementación
* Se requiere un punto final de actualización adicional
* La rotación de tokens debe gestionarse con cuidado

---

## Alternativas descartadas

### Sesiones del lado del servidor

Ventajas:

* Modelo mental sencillo

Inconvenientes:

* Requiere almacenamiento de sesiones del lado del servidor
* Menor escalabilidad

### Solo JWT

Ventajas:

* Implementación más sencilla

Inconvenientes:

* Experiencia de usuario deficiente debido a los inicios de sesión frecuentes
* Gestión complicada de la caducidad de los tokens