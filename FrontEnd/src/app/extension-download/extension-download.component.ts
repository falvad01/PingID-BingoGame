import { Component, OnInit, HostListener } from '@angular/core';
import { ExtensionService } from 'src/services/extension/extension.service';

@Component({
    selector: 'app-extension-download',
    templateUrl: './extension-download.component.html',
    styleUrls: ['./extension-download.component.scss']
})
export class ExtensionDownloadComponent implements OnInit {
    extensionVersion = '1.0';
    extensionFileSize = '~20 KB';
    downloadUrl = '/assets/extension/pingid-bingo-extension.zip';
    isLoading = true;
    latestVersionId: number = 0;
    showScrollIndicator = true;

    browsers = [
        { name: 'Chrome', icon: '🌐', url: 'chrome://extensions/' },
        { name: 'Edge', icon: '🔷', url: 'edge://extensions/' },
        { name: 'Brave', icon: '🦁', url: 'brave://extensions/' }
    ];

    features = [
        {
            icon: '🔐',
            title: 'Login Integrado',
            description: 'Autenticación segura con tus credenciales'
        },
        {
            icon: '🤖',
            title: 'Detección Automática',
            description: 'Encuentra el número PingID automáticamente'
        },
        {
            icon: '📤',
            title: 'Envío Inteligente',
            description: 'Solo envía el primer número del día'
        },
        {
            icon: '🎯',
            title: 'Sin Interrupciones',
            description: 'Abre el Bingo en segundo plano'
        }
    ];

    installSteps = [
        {
            title: 'Descarga la Extensión',
            description: 'Haz clic en el botón de descarga y guarda el archivo ZIP.',
            note: 'Guarda en una ubicación fácil de encontrar'
        },
        {
            title: 'Extrae el Archivo ZIP',
            description: 'Haz clic derecho y selecciona "Extraer todo...".',
            note: null
        },
        {
            title: 'Abre las Extensiones',
            description: 'Ve a chrome://extensions/ (o edge://extensions/ para Edge).',
            note: 'También desde el menú: ⋮ → Más herramientas → Extensiones'
        },
        {
            title: 'Activa Modo Desarrollador',
            description: 'Busca el toggle "Modo de desarrollador" y actívalo.',
            note: null
        },
        {
            title: 'Carga la Extensión',
            description: 'Haz clic en "Cargar extensión sin empaquetar" y selecciona la carpeta extraída.',
            note: 'Selecciona la carpeta, no el ZIP'
        },
        {
            title: '¡Listo!',
            description: 'Haz clic en el icono de la extensión e inicia sesión.',
            note: 'Ya está configurada para funcionar automáticamente'
        }
    ];

    installStepsCompact = [
        { title: 'Descarga', description: 'Haz clic en el botón y guarda el ZIP' },
        { title: 'Extrae', description: 'Descomprime el archivo ZIP' },
        { title: 'Extensiones', description: 'Abre chrome://extensions/' },
        { title: 'Modo Dev', description: 'Activa "Modo de desarrollador"' },
        { title: 'Cargar', description: 'Selecciona la carpeta extraída' },
        { title: '¡Listo!', description: 'Inicia sesión en la extensión' }
    ];

    constructor(private extensionService: ExtensionService) { }

    ngOnInit(): void {
        this.loadLatestVersion();
    }

    @HostListener('window:scroll', ['$event'])
    onScroll(): void {
        // Hide scroll indicator when user starts scrolling
        if (window.scrollY > 50) {
            this.showScrollIndicator = false;
        }
    }

    loadLatestVersion(): void {
        this.extensionService.getLatestVersion().subscribe({
            next: (version) => {
                this.latestVersionId = version.id;
                this.extensionVersion = version.version;
                this.extensionFileSize = this.extensionService.formatFileSize(version.file_size);
                this.downloadUrl = this.extensionService.getDownloadUrl(version.id);
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading latest version:', error);
                // Fallback to default values
                this.isLoading = false;
            }
        });
    }

    downloadExtension(): void {
        // Mark as seen only when user clicks download button
        if (this.latestVersionId) {
            this.extensionService.markVersionAsSeen(this.latestVersionId);
        }

        // Trigger download using the dynamic URL
        const link = document.createElement('a');
        link.href = this.downloadUrl;
        link.download = 'pingid-bingo-extension-v' + this.extensionVersion + '.zip';
        link.click();
    }
}
