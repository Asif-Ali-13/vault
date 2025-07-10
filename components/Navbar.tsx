import { Vault } from "lucide-react";
import { ModeToggle } from "./ui/ModeToggle";

export const Navbar = () => {
    return (
        <nav className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
                <Vault className="size-8"/>
                <span className="tracking-tighter text-3xl font-extrabold text-primary flex gap-2 items-center">
                    Vault
                </span>
            </div>
            <ModeToggle/>
        </nav>
    );
}