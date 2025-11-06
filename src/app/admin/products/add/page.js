"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProductForm from "@/components/admin/ProductForm";

export default function AddProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirección de autenticación
  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (status === "authenticated" && session?.user?.role !== "admin")
    ) {
      router.push("/auth/signin?callbackUrl=/admin");
    }
  }, [status, session, router]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderTopColor: "#F6C343", borderBottomColor: "#F6C343" }}
        ></div>
      </div>
    );
  }

  // Si no está autenticado o no es admin, no mostrar nada
  if (
    status === "unauthenticated" ||
    (status === "authenticated" && session?.user?.role !== "admin")
  ) {
    return null;
  }

  // Usar el ProductForm unificado sin pasar producto (modo crear)
  return <ProductForm />;
}
