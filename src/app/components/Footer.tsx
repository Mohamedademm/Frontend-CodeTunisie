import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Send, Heart, Shield } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-colored">
                <span className="text-white font-bold text-xl">CT</span>
              </div>
              <span className="font-bold text-2xl text-foreground">CodeTunisiePro</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              La plateforme n°1 en Tunisie pour l'apprentissage du Code de la route.
              Une méthode pédagogique moderne, interactive et efficace.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all hover:scale-110">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground text-lg mb-6">Navigation</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="/courses" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div> Cours en ligne</a></li>
              <li><a href="/tests" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div> Tests & Quiz</a></li>
              <li><a href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div> Mon progression</a></li>
              <li><a href="/premium" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div> Offre Premium</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground text-lg mb-6">Contactez-nous</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span>Immeuble Jasmine, Av. Habib Bourguiba,<br />1000 Tunis, Tunisie</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+216 71 123 456</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>contact@codetunisiepro.tn</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-foreground text-lg mb-6">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Recevez nos derniers conseils et astuces pour réussir votre permis.
            </p>
            <div className="space-y-3">
              <Input placeholder="Votre email" className="bg-background" />
              <Button className="w-full gap-2">
                S'abonner <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Données sécurisées & sans spam</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>&copy; 2026 CodeTunisiePro. Fait avec</span>
            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
            <span>en Tunisie.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Mentions légales</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Confidentialité</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Conditions d'utilisation</a>
          </div>
        </div>
      </div>
    </footer>
  );
}