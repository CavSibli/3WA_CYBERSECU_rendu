import { z } from "zod";

// Schéma pour l'inscription
export const registerSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)"
    ),
  // Ne jamais accepter role depuis le body
});

// Schéma pour la connexion
export const loginSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(1, "Le mot de passe est obligatoire"),
});

// Schéma pour la vérification OTP
export const verifyOtpSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(1, "Le mot de passe est obligatoire"),
  code: z
    .string()
    .min(6, "Le code doit contenir au moins 6 caractères")
    .max(8, "Le code ne peut pas dépasser 8 caractères")
    .refine(
      (val) => {
        // Accepter soit un code OTP (6 chiffres) soit un code de secours (8 caractères alphanumériques)
        return (val.length === 6 && /^\d+$/.test(val)) || (val.length === 8 && /^[A-Z0-9]+$/.test(val.toUpperCase()));
      },
      {
        message: "Le code doit être soit un code OTP à 6 chiffres, soit un code de secours à 8 caractères alphanumériques",
      }
    ),
});

// Types TypeScript dérivés des schémas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

