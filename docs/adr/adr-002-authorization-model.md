# ADR-002: Modelo de autorización mediante el control de acceso basado en roles (RBAC)

## Estado

Aceptado

## Fecha

20 de junio de 2026

## Contexto

La aplicación admite dos roles de usuario diferentes:

* Paciente
* Nutricionista

El sistema gestiona información sensible relacionada con la salud.

Los pacientes solo deben acceder a sus propios historiales.

Los nutricionistas solo deben acceder a la información correspondiente a los pacientes que se les hayan asignado.

El modelo de autorización debe ser:

* Fácil de entender
* Fácil de mantener
* Ampliable para futuros roles

Alternativas consideradas:

1. Permisos codificados de forma fija en los controladores
2. Autorización basada únicamente en la propiedad
3. Control de acceso basado en roles (RBAC)

---

## Decisión

La aplicación utilizará el control de acceso basado en roles (RBAC).

Roles admitidos:

* PACIENTE
* NUTRICIONISTA

Los permisos se aplicarán en la capa de servicio.

Se aplicará una validación adicional de la propiedad cuando sea necesario.

---

## Reglas de autorización

### PACIENTE

Puede:

* Ver su propio perfil
* Crear entradas de hábitos
* Ver su propio historial de hábitos

No puede:

* Ver a otros pacientes
* Acceder a los recursos de los nutricionistas

---

### NUTRICIONISTA

Puede:

* Ver a los pacientes que tiene asignados
* Ver el historial de hábitos de los pacientes que tiene asignados

No puede:

* Acceder a pacientes no asignados
* Modificar los registros de los pacientes

---

## Justificación

El RBAC proporciona una clara separación de responsabilidades.

El modelo sigue siendo sencillo, ya que actualmente solo existen dos roles.

La validación de la propiedad complementa el modelo RBAC y evita el acceso no autorizado a los recursos que pertenecen a otros usuarios.

Ejemplo:
Un paciente puede tener el rol «PACIENTE», pero aún así debe impedírsele el acceso a los registros de hábitos de otro paciente.

---

## Consecuencias

### Positivas

* Modelo de permisos claro
* Pruebas más sencillas
* Mantenimiento más sencillo
* Permite la ampliación futura de los roles

### Negativas

* Se requieren comprobaciones de autorización adicionales
* Más código en comparación con el acceso sin restricciones

---

## Alternativas descartadas

### Autorización codificada de forma rígida

Ventajas:

* Implementación rápida

Inconvenientes:

* Difícil de mantener
* Los permisos quedan dispersos por todo el código

### Autorización basada únicamente en la propiedad

Ventajas:

* Sencilla

Inconvenientes:

* No se adapta bien cuando se introducen roles adicionales
* Las reglas de negocio se vuelven más difíciles de gestionar
