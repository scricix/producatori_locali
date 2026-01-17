# 🌿 Local Producers Marketplace Platform

O platformă modernă de tip Marketplace e-commerce, concepută pentru a conecta producătorii locali direct cu consumatorii. Proiectul este construit cu un accent deosebit pe **Aesthetic UI/UX**, **Mobile responsiveness** și o experiență de utilizare fluidă.

## ✨ Caracteristici Principale

### 🛒 Experiența Cumpărătorului
- **Catalog Produse Dinamic:** Filtrare avansată după categorii (Legume, Fructe, Lactate etc.), preț și căutare în timp real.
- **Galerie Imagini Premium:** Lightbox interactiv pentru vizualizarea produselor în detaliu.
- **Coș de Cumpărături:** Gestiune completă a produselor cu update în timp real al cantităților și prețului.
- **Sistem de Checkout Multi-Vendor:** Posibilitatea de a cumpăra de la mai mulți producători într-o singură comandă.
- **Notificări Email:** Confirmări automate ale comenzii și update-uri de status trimise prin email (HTML templates).

### 👨‍🌾 Panoul Producătorului (Dashboard)
- **Gestiune Produse:** Adăugarea, editarea și ștergerea produselor cu suporte pentru multiple imagini (max. 5 per produs).
- **Management Comenzi:** Vizualizare comenzi primite, detalii clienți și actualizarea statusului comenzii (Nouă, Procesare, Finalizată).
- **Statistici Venituri:** Calcul automat al veniturilor bazat pe comenzile finalizate.
- **Locație & Stoc:** Filtrare administrativă bazată pe județ/oraș și gestiunea stocurilor unitare.

### 📱 Design & Performanță
- **Fully Responsive:** Optimizat pentru orice dispozitiv (Mobile-First approach), fără scroll orizontal.
- **Aesthetic UI:** Design minimalist cu paletă de culori inspirată din natură, animații fluide și glassmorphism.
- **Securitate:** Sistem de autentificare (Login/Register) cu roluri diferențiate (Client vs Producător).

## 🛠️ Stack Tehnologic

- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (ES6+ Mobile-ready)
- **Backend:** PHP 8.x (API-based architecture)
- **Bază de Date:** MySQL / MariaDB (Relațională)
- **Utilitare:** PHPMailer (concept), FontAwesome, Google Fonts

## ⚙️ Instalare și Configurare

1. **Clonează depozitul:**
   ```bash
   git clone https://github.com/username/local-producers-marketplace.git
   ```

2. **Configurare Server:**
   - Copiază folderul în `htdocs` (XAMPP) sau directorul rădăcină al serverului tău Apache/Nginx.

3. **Baza de Date:**
   - Importă fișierul `database/schema.sql` (sau fișierele numerotate din folderul `database/`) în phpMyAdmin.

4. **Configurare:**
   - Redenumește `config/database.php.example` în `config/database.php` și adaugă datele tale de conectare.

5. **Lansare:**
   - Accesează `http://localhost/local-producers-marketplace` în browser.

## 📄 Licență
Acest proiect este licențiat sub MIT License.

---
*Dezvoltat cu ❤️ pentru susținerea economiei locale.*
