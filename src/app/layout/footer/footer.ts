import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WhatsAppService } from '../../core/services/whatsapp.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent {
  private whatsapp = inject(WhatsAppService);
  year = new Date().getFullYear();

  openWhatsApp(): void {
    this.whatsapp.openWhatsApp(this.whatsapp.buildContactMessage());
  }
}
