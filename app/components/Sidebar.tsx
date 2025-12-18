"use client";

import { getAuth, signOut } from "firebase/auth"
import { app } from "../utils/firebase"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast";

import { House } from 'lucide-react';
import { Users } from 'lucide-react';
import { ClipboardMinus } from 'lucide-react';
import { Package2 } from 'lucide-react';
import { Info } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { LoaderCircle } from "lucide-react";

import { useState } from "react";
import Image from "next/image";

type SidebarProps = {
    onSelectModulo: (modulo: string) => void;
};

const navItems = [
    { key: "inicio", icon: <House />, label: "Inicio" },
    { key: "clientes", icon: <Users />, label: "Clientes" },
    { key: "reportes", icon: <ClipboardMinus />, label: "Reportes" },
    { key: "inventario", icon: <Package2 />, label: "Inventario" },
    { key: "autor", icon: <Info />, label: "Autor" },
];

const Sidebar: React.FC<SidebarProps> = ({ onSelectModulo }) => {
    const [active, setActive] = useState<string>("inicio");
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();

    const handleSelect = (modulo: string) => {
        setActive(modulo);
        onSelectModulo(modulo);
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/logout", { method: "POST" });
            // Opcional: puedes limpiar Firebase Auth localmente también si quieres
            const auth = getAuth(app);
            await signOut(auth);
            router.push("/"); // Redirige a la pantalla de login protegida
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error("Error al cerrar sesión", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <>
            {/* Sidebar Desktop */}
            <nav className="hidden md:flex h-screen w-24 bg-gradient-to-b from-yellow-50 to-white shadow-2xl flex-col items-center py-8 px-2 space-y-8">
                <div className="mb-10">
                    <Image src={"/images/logocompina.webp"} alt={"logo empresa"} width={60} height={60} className="rounded-lg shadow-md" />
                </div>
                <div className="flex flex-col space-y-6 flex-1 items-center w-full">
                    {navItems.map(item => (
                        <button
                            key={item.key}
                            onClick={() => handleSelect(item.key)}
                            className={`group relative p-3 rounded-xl flex items-center justify-center w-12 h-12 transition-all duration-200
                                ${active === item.key
                                    ? "bg-gradient-to-tr from-yellow-200 to-yellow-400 text-gray-900 shadow-lg scale-110"
                                    : "hover:bg-yellow-100 hover:scale-105 text-gray-500"}
                            `}
                            aria-label={item.label}
                        >
                            {item.icon}
                            <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-yellow-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
                <button
                    className="bg-gradient-to-tr from-gray-900 hover:from-gray-800 to-gray-700 hover:to-gray-600 text-white hover:text-gray-400 p-4 rounded-full hover:bg-gray-800 flex items-center justify-center shadow-lg transition-all duration-200"
                    aria-label={"Cerrar sesión"}
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                >
                    {isLoggingOut ? (
                        <LoaderCircle className="animate-spin" />
                    ) : (
                        <LogOut />
                    )}
                </button>
            </nav>

            {/* Sidebar Mobile - Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-yellow-50 to-white shadow-2xl flex items-center justify-around py-2 px-4 z-50 border-t border-yellow-200">
                {navItems.map(item => (
                    <button
                        key={item.key}
                        onClick={() => handleSelect(item.key)}
                        className={`group relative p-2 rounded-xl flex flex-col items-center justify-center min-w-0 flex-1 transition-all duration-200
                            ${active === item.key
                                ? "bg-gradient-to-tr from-yellow-200 to-yellow-400 text-gray-900 shadow-lg"
                                : "hover:bg-yellow-100 text-gray-500"}
                        `}
                        aria-label={item.label}
                    >
                        <div className="w-5 h-5 mb-1">
                            {item.icon}
                        </div>
                        <span className="text-xs font-medium truncate w-full text-center">
                            {item.label}
                        </span>
                    </button>
                ))}
                <button
                    className="bg-gradient-to-tr from-gray-900 to-gray-700 text-white p-2 rounded-xl flex flex-col items-center justify-center min-w-0 flex-1 shadow-lg transition-all duration-200"
                    aria-label={"Cerrar sesión"}
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                >
                    <div className="w-5 h-5 mb-1">
                        {isLoggingOut ? (
                            <LoaderCircle className="animate-spin" />
                        ) : (
                            <LogOut />
                        )}
                    </div>
                    <span className="text-xs font-medium">
                        Salir
                    </span>
                </button>
            </nav>
        </>
    );
};

export default Sidebar;