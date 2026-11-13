# 🎓 CampusMarket Frontend • Centro Tutorial Cereté 🛒

> **Interfaz Web de Comercio Estudiantil para el Centro Tutorial Cereté (Universidad de Cartagena).**  
> Desarrollado con **React 19**, **TypeScript**, **Vite** y **Tailwind CSS**, conectado con la API de `e-commerce-universitary-backend`.

---

## 🌟 Características y Experiencia de Usuario

1. **Sede Oficial Exclusiva: Centro Tutorial Cereté**:
   - Todo el flujo de navegación, registro y perfiles está enfocado en la sede universitaria de Cereté.
   - Puntos de encuentro definidos en campus (Biblioteca, Cafetería, Pasillo Central, Kiosco).

2. **Moneda Oficial: Pesos Colombianos (COP)**:
   - Formateo dinámico en vivo en todos los formularios (`$ 25.000 COP`).

3. **Cuentas Duales y Switch Role con 1 Clic**:
   - Selector visual de modalidad (Comprador / Vendedor) en Login y Registro.
   - Botón directo en el Navbar para cambiar de modalidad al instante sin desloguearse.

4. **Recuperación de Contraseña con Código de 6 Dígitos**:
   - Vista en 3 pasos en `/forgot-password`.
   - Envío de código numérico a Gmail con expiración de 15 minutos.
   - Botón de alternancia de contraseña (👁️ ver / ocultar) en todos los campos de contraseña.

5. **Visualizador Multi-ángulo 360° y Lupa de Zoom al Cursor**:
   - Inspección manual mediante miniaturas y carrusel.
   - Efecto de lupa interactiva (`transform: scale(2.2)`) siguiendo la posición del puntero del mouse sobre la fotografía principal.

6. **Showcase Visual de Categorías**:
   - Tarjetas interactivas con iconos temáticos para las 7 categorías oficiales:
     📚 Libros, 💻 Tecnología, ✏️ Papelería, 🥪 Snacks, 👕 Ropa, 🖨️ Servicios, 🎒 Varios.

7. **Panel de Vendedor Dedicado (`/seller`)**:
   - Administración tipo lista y tarjeta de productos propios.
   - Aislado del carrito de compras para evitar auto-compras erróneas.

---

## 🚀 Comandos Rápidos

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo
npm run dev

# 3. Compilar a producción
npm run build
```

---

## 🏛️ Créditos
- **Centro Tutorial Cereté** — Universidad de Cartagena
- **CampusMarket 2026**
