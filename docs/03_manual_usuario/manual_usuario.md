# 3. Manual de Usuario

## 3.1 Introducción

El presente manual describe el funcionamiento del sistema **fall-detection-system** desde la perspectiva del usuario final y del cuidador.

Su objetivo es explicar de manera clara y estructurada cómo acceder al sistema, interpretar la información mostrada y utilizar sus principales funcionalidades.

---

## 3.2 Acceso al sistema

El acceso a la aplicación se realiza mediante autenticación con:

- Correo electrónico y contraseña
- Inicio de sesión mediante proveedor externo (Google)

Tras la autenticación, la interfaz se adapta automáticamente en función del rol asignado al usuario (persona usuaria o cuidador).

El sistema incorpora mecanismos de control de acceso que restringen determinadas funcionalidades según el perfil autenticado.

---

## 3.3 Uso para personas usuarias

Las personas usuarias disponen de las siguientes funcionalidades:

- Consulta del estado del dispositivo asociado.
- Visualización del historial de eventos registrados.
- Activación manual de alerta mediante el botón de emergencia físico.

El sistema monitoriza de forma continua la actividad del dispositivo IoT y registra automáticamente cualquier evento de caída detectado.

---

## 3.4 Uso para cuidadores

El perfil de cuidador dispone de funcionalidades ampliadas para la supervisión de múltiples usuarios.

Entre sus capacidades principales se incluyen:

- Visualización en tiempo real de alertas de caída.
- Consulta detallada del historial de eventos.
- Identificación del usuario y dispositivo asociados a cada evento.
- Análisis gráfico de la información registrada.

---

### 3.4.1 Gestión de alertas

Cuando el sistema detecta una caída confirmada, el flujo es el siguiente:

1. El backend registra el evento en la base de datos.
2. Se genera una alerta visible en la interfaz web.
3. El cuidador puede consultar los detalles del evento.
4. Se posibilita la actuación inmediata en función del contexto.

Este mecanismo permite una respuesta rápida ante situaciones de riesgo.
