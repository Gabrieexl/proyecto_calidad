"use client";

import Image from "next/image";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import { app } from "../utils/firebase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { LoaderCircle } from "lucide-react";

function getFriendlyAuthError(code?: string) {
  // Mensajes claros (pero sin esconder el código real para debug)
  switch (code) {
    case "auth/invalid-email":
      return "El correo no es válido.";
    case "auth/missing-password":
      return "Ingresa tu contraseña.";
    case "auth/user-disabled":
      return "Este usuario está deshabilitado.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Credenciales inválidas.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Intenta más tarde.";
    case "auth/network-request-failed":
      return "Error de red. Revisa tu conexión.";
    case "auth/unauthorized-domain":
      return "Dominio no autorizado en Firebase. Agrega tu dominio de Vercel en Authorized domains.";
    default:
      return "No se pudo iniciar sesión.";
  }
}

export default function Form() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      toast.error("Completa correo y contraseña.");
      return;
    }

    setIsLoading(true);

    try {
      // 1) Login Firebase
      const auth = getAuth(app);
      const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);

      // 2) Token
      const token = await userCred.user.getIdToken(true);

      // 3) Crear sesión en servidor (cookie) - IMPORTANTE: validar respuesta
      const res = await fetch("/api/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        cache: "no-store",
      });

      if (!res.ok) {
        // intenta leer mensaje de error del backend
        let detail = "";
        try {
          const data = await res.json();
          detail = data?.error || data?.message || "";
        } catch {
          // ignore json parse errors
        }

        // Cierra sesión en cliente por consistencia si el server no pudo setear cookie
        try {
          await auth.signOut();
        } catch {
          // ignore
        }

        throw new Error(
          `SET_SESSION_FAILED:${res.status}${detail ? `:${detail}` : ""}`
        );
      }

      toast.success("Inicio de sesión exitoso");
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      // DEBUG REAL: loguea el error
      console.error("LOGIN ERROR:", err);

      // Si es error de Firebase
      const fb = err as FirebaseError;
      if (fb?.code?.startsWith("auth/")) {
        const msg = getFriendlyAuthError(fb.code);
        // Muestra un toast claro y también el code para que tú detectes la causa en Vercel
        toast.error(`${msg} (${fb.code})`);
        return;
      }

      // Si falló el endpoint de sesión
      if (err instanceof Error && err.message.startsWith("SET_SESSION_FAILED:")) {
        // Ejemplo: SET_SESSION_FAILED:500:Missing FIREBASE_ADMIN_PRIVATE_KEY
        const parts = err.message.split(":");
        const status = parts[1] || "???";
        const detail = parts.slice(2).join(":");
        toast.error(
          detail
            ? `No se pudo crear sesión en servidor (HTTP ${status}): ${detail}`
            : `No se pudo crear sesión en servidor (HTTP ${status}).`
        );
        return;
      }

      toast.error("Ocurrió un error inesperado al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="bg-white shadow-lg rounded-xl px-10 py-8 flex flex-col gap-6 min-w-[340px] max-w-[400px]"
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <div className="flex justify-center mb-2">
        <Image
          src={"/images/Compipro_Logo.webp"}
          alt="Logo Image"
          width={120}
          height={120}
          className="rounded-full"
          priority
        />
      </div>

      <h1 className="text-2xl font-bold text-center text-gray-800">¡Bienvenido!</h1>
      <span className="text-center text-gray-500 text-sm">
        Ingrese sus credenciales para acceder al sistema CRM de Compina S.A.C.
      </span>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-gray-700 font-medium">
          Correo Electrónico
        </label>
        <input
          id="email"
          type="email"
          placeholder="user123@gmail.com"
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-gray-700 font-medium">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          placeholder="********"
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-yellow-400 hover:bg-yellow-700 disabled:opacity-70 text-white font-semibold rounded-md py-2 transition-colors mt-2 shadow flex text-center items-center justify-center"
      >
        {isLoading && <LoaderCircle className="mr-2 size-4 animate-spin" />}
        Ingresar
      </button>
    </form>
  );
}
