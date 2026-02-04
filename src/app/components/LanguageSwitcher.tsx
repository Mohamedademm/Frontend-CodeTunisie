import { useTranslation } from 'react-i18next';
import { Button } from "@/app/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        document.dir = lng === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lng;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    <Globe className="h-5 w-5" />
                    <span className="sr-only">Changer la langue / تغيير اللغة</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('fr')} className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xl">🇫🇷</span>
                    <span>Français</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('ar')} className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xl">🇹🇳</span>
                    <span>العربية</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
